import { WebSocket, WebSocketServer } from 'ws';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/* TYPES */
interface Lobby {
  password: string;
  host: WebSocket;
  hostId: string;
  users: User[]
  deck: CardData[];
  timeStart: Date|undefined;
  started: boolean;
}

interface User {
  name: string;
  id: string;
  socket: WebSocket;
}


interface Message {
  action: string;
  user: string;
  lobbyname: string;
  password: string;
  id: string;
}

interface ServerMessage {
  action: string;
  user: string;
  message: string;
}

interface CardData {
  id: number;
  flipped: boolean;
  front: string;
  back: string;
}

/* DATA INIT */
let deck: CardData[] = [
  {id: 0, flipped: false, front: "blueberry", back: "peach"},
  {id: 1, flipped: false, front: "blueberry", back: "apple"},
  {id: 2, flipped: false, front: "blueberry", back: "lemon"},
  {id: 3, flipped: false, front: "peach", back: "orange"},
  {id: 4, flipped: false, front: "peach", back: "cherry"},
  {id: 5, flipped: false, front: "apple", back: "lemon"},
  {id: 6, flipped: false, front: "apple", back: "orange"},
  {id: 7, flipped: false, front: "lemon", back: "cherry"},
  {id: 8, flipped: false, front: "orange", back: "cherry"},
];
let deckStr = JSON.stringify(deck);
let lobbies: Map<string, Lobby> = new Map();

// PROD environment variable used to tell if production or not
// 0 - not in production
// 1 - in production
let wss: WebSocketServer;
let server;
if(process.env.PROD == '1') {
  console.log('in production')
  server = https.createServer({
    cert: fs.readFileSync(process.env.CERTFILE),
    key: fs.readFileSync(process.env.KEYFILE)
  });
  wss = new WebSocketServer({
    server: server
  });
} else {
  console.log('not in production')
  wss = new WebSocketServer({
    port: 1400,
  });
}


//console.log("server started on port " + server.address());

/* FUNCTIONS */
function updateUser(users: User[], id: string, user: User) {
  users.forEach(e => {
    if(e.id == id){
      e.name = user.name;
      e.socket = user.socket;
    }
  });
}

// Will return true if a user was added, but false if a user was updated.
function addUser(users: User[], user: User): boolean {
  for(let i = 0; i < users.length; i++) {
    if(users[i].id == user.id) {
      users[i].socket = user.socket;
      users[i].name = user.name;
      return false;
    }
  }
  users.push(user);
  return true;
}

function createLobby(m: Message, ws: WebSocket) {
  if(!lobbies.has(m.lobbyname)) {
    console.log("Lobby " + m.lobbyname + " created.")
    let host: User = {name: m.user, id: m.id, socket: ws};
    lobbies.set(m.lobbyname, {started: false, password: m.password, host: ws, hostId: m.id, timeStart: undefined, users: [host], deck: JSON.parse(deckStr)});
    let message: ServerMessage = {action: "created", user: null, message: "Created lobby"}
    ws.send(JSON.stringify(message));
  } else {
    let lobby = getLobby(m, ws);
    if(lobby == null) {
      console.log("Failed to create " + m.lobbyname + " it already exists");
      let message: ServerMessage = {action: "error", user: null, message: "Error: Lobby with this name already exists."}
      ws.send(JSON.stringify(message));
    } else {
      // if host is same as before just update the host
      if(lobby.hostId == m.id) {
        console.log('host reconnected');
        let message: ServerMessage = {action: "hostreconnect", user: m.user, message: JSON.stringify(lobby.users.map(e => e.name))};
        ws.send(JSON.stringify(message));
        updateUser(lobby.users, m.id, {name: m.user, id: m.id, socket: ws});
        lobby.host = ws;
        // if started send them the game
        if(lobby.started) {
          let message: ServerMessage = {action: "start", user: m.user, message: JSON.stringify(lobby.deck)};
          ws.send(JSON.stringify(message));
        }
      } else {
        console.log("Failed to create " + m.lobbyname + " it already exists");
        let message: ServerMessage = {action: "error", user: null, message: "Error: Lobby with this name already exists."}
        ws.send(JSON.stringify(message));
      }
    }
  }
}

function joinLobby(m: Message, ws: WebSocket) {
  let lobby: Lobby = getLobby(m,ws);
  if(lobby != null){
    console.log(m.user + " joined lobby " + m.lobbyname);
    // send all current users to new user.
    let message: ServerMessage = {action: "userlist", user: m.user, message: JSON.stringify(lobby.users.map(e => e.name))};
    ws.send(JSON.stringify(message));
    // send new user to all existing users.
    if(addUser(lobby.users, {id: m.id, name: m.user, socket: ws})) {
      message = {action: "join", user: m.user, message: "joined lobby"}
      lobby.users.forEach(e => {
        try{
          //console.log('send message!!!')
          e.socket.send(JSON.stringify(message));
        } catch (er) { /* just ignore error */  console.log('failed to send'); console.log(er); }
      });
    }

    // if they join mid game, send them the ongoing game.
    if(lobby.started) {
      let message: ServerMessage = {action: "start", user: m.user, message: JSON.stringify(lobby.deck)};
      ws.send(JSON.stringify(message));
    }
  } else {
    console.log(m.user + " failed to join " + m.lobbyname);
    let message: ServerMessage = {action: "conerr", user: m.user, message: ""};
    ws.send(JSON.stringify(message));
  }
}

function shuffle(array: CardData[]) {
  for(let i = array.length-1; i > 0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j],array[i]];
  }
  for(let i = 0; i < array.length; i++){
    if(Math.floor(Math.random() * 2) == 0){
      array[i].flipped = true;
    }
  }
}

function startGame(m: Message, ws: WebSocket) {
  let lobby: Lobby = getLobby(m,ws);
  if(lobby != null && lobby.hostId == m.id){
    console.log("starting game in " + m.lobbyname);
    // first shuffle
    shuffle(lobby.deck);
    let message: ServerMessage = {action: "start", user: m.user, message: JSON.stringify(lobby.deck)};
    lobby.users.forEach(e => {
      try{
        //console.log('send message!!!')
        e.socket.send(JSON.stringify(message));
      } catch (er) { /* just ignore error */  console.log('failed to send'); console.log(er); }
    });
    lobby.timeStart = new Date();
    lobby.started = true;
  } else {
    console.log(m.user + " failed to start game in " + m.lobbyname);
  }
}

function pingLobby(m: Message, ws: WebSocket) {
  let lobby: Lobby = lobbies.get(m.lobbyname);
  console.log("ping started");
  if(lobby != undefined){
    console.log("ping sucess");
    let message: ServerMessage;
    if(lobby.password == "") {
      message= {action: "pong", user: m.user, message: "nopassword"}
    } else {
      message= {action: "pong", user: m.user, message: "yespassword"}
    }
    ws.send(JSON.stringify(message));
  } else {
    console.log("ping fail");
    let message: ServerMessage = {action: "pong", user: null, message: "nolobby"}
    ws.send(JSON.stringify(message));
  }
}

function pingLobbyHost(m: Message, ws: WebSocket) {
  console.log("pinging lobby");
  if(lobbies.has(m.lobbyname)){
    let message: ServerMessage = {action: "pong", user: null, message: "lobby taken"}
    console.log("lobby taken");
    ws.send(JSON.stringify(message));
  } else {
    console.log("lobby is available");
    let message: ServerMessage = {action: "pong", user: null, message: "lobby available"}
    ws.send(JSON.stringify(message));
  }
}

function sendWin(m: Message, ws: WebSocket) {
  let lobby: Lobby = getLobby(m,ws);
  if(lobby != null){
    let now: Date = new Date();
    let sm: ServerMessage = {action: "win", user: m.user, message: String(((+now)-(+lobby.timeStart)))};
    lobby.started = false;
    //console.log(String(((+now)-(+lobby.timeStart))));
    lobby.users.forEach(e => {
      try{
        //console.log('send message!!!')
        e.socket.send(JSON.stringify(sm));
      } catch (er) { /* just ignore error */  console.log('failed to send'); console.log(er); }
    });
  }
}

function getLobby(m: Message, ws: WebSocket) : Lobby {
  if(lobbies.has(m.lobbyname)){
    let lobby: Lobby = lobbies.get(m.lobbyname);
    if(lobby.password === m.password){
      return lobby;
    } else {
      // password was incorrect
      return null;
    }
  } else {
    // Lobby was not found
    return null;
  }
}

function printDebug(m: Message, ws: WebSocket) {
  console.log('debug called');
  for( let [n,l] of lobbies) {
    console.log("\n\n");
    console.log("Lobby: " + n);
    console.log("Host: " + l.host);
    console.log("Password: " + l.password);
    console.log("Num users: " + l.users.length);
  }
}

/* WEBSOCKET SERVER */
wss.on('connection', function connection(ws: WebSocket) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    let m: Message = JSON.parse(String(data));
    console.log("message recived");
    console.log(m);
    switch(m.action){
       case("host"): createLobby(m,ws); break;
       case("connect"): joinLobby(m,ws); break;
       case("ping"): pingLobby(m,ws); break;
       case("pinghost"): pingLobbyHost(m,ws); break;
       case("win"): sendWin(m,ws); break;
       case("debug"): printDebug(m,ws); break;
       case("start"): startGame(m,ws); break;
    }
  });

  console.log("user connected");
});

// On 1 min timer, clear any lobbies with dead hosts
let interval = setInterval(function ping() {
  for( let [n,l] of lobbies) {
    if(l.host.readyState !== WebSocket.CLOSED) {
      console.log('open');
    } else { 
      console.log("removing lobby: " + n);
      lobbies.delete(n);
    }
  }
}, 60000);

wss.on("close", function close() {
  clearInterval(interval);
});

if(process.env.PROD == '1') {
  server.listen(function listen() {
    const ws = new WebSocket(`wss://localhost:${server.address()['port']}`, {rejectUnauthorized: false});
    ws.on('error', console.error);
    ws.on('open', function open() {
      console.log(`wss://localhost:${server.address()['port']}`);
    });
  });
}