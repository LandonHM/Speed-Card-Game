import { WebSocket, WebSocketServer } from 'ws';

/* TYPES */
interface Lobby {
  password: String;
  host: WebSocket;
  users: Set<WebSocket>;
  usersStr: String[];
  deck: CardData[];
  timeStart: Date|undefined;
}

interface Message {
  action: String;
  user: String;
  lobbyname: String;
  password: String;
  message: String;
}

interface ServerMessage {
  action: String;
  user: String;
  message: String;
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
let lobbies: Map<String, Lobby> = new Map();

const wss: WebSocketServer = new WebSocketServer({
  port: 1400
});

console.log("server started on port " + wss.address()['port']);

/* FUNCTIONS */

function createLobby(m: Message, ws: WebSocket) {
  if(!lobbies.has(m.lobbyname)) {
    console.log("Lobby " + m.lobbyname + " created.")
    lobbies.set(m.lobbyname, {password: m.password, usersStr: [m.user], host: ws, timeStart: undefined, users: new Set([ws]), deck: JSON.parse(deckStr)});
  } else {
    console.log("Failed to create " + m.lobbyname + " it already exists");
    let message: ServerMessage = {action: "error", user: null, message: "Error: Lobby with this name already exists."}
    ws.send(JSON.stringify(message));
  }
}

function joinLobby(m: Message, ws: WebSocket) {
  let lobby: Lobby = getLobby(m,ws);
  if(lobby != null){
    console.log(m.user + " joined lobby " + m.lobbyname);
    // send all current users to new user.
    let message: ServerMessage = {action: "userlist", user: m.user, message: JSON.stringify(lobby.usersStr)};
    ws.send(JSON.stringify(message));
    // send new user to all existing users.
    message = {action: "join", user: m.user, message: "joined lobby"}
    lobby.users.forEach(e => {
      try{
        //console.log('send message!!!')
        e.send(JSON.stringify(message));
      } catch (er) { /* just ignore error */  console.log('failed to send'); console.log(er); }
    });
    lobby.usersStr.push(m.user);
    lobby.users.add(ws);
  } else {
    console.log(m.user + " failed to join " + m.lobbyname);
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
  if(lobby != null){
    console.log("starting game in " + m.lobbyname);
    // first shuffle
    shuffle(lobby.deck);
    let message: ServerMessage = {action: "start", user: m.user, message: JSON.stringify(lobby.deck)};
    lobby.users.forEach(e => {
      try{
        //console.log('send message!!!')
        e.send(JSON.stringify(message));
      } catch (er) { /* just ignore error */  console.log('failed to send'); console.log(er); }
      lobby.timeStart = new Date();
    });
  } else {
    console.log(m.user + " failed to start game in " + m.lobbyname);
  }
}

function pingLobby(m: Message, ws: WebSocket) {
  let lobby: Lobby = getLobby(m,ws);
  console.log("ping started");
  if(lobby != null){
    let message: ServerMessage = {action: "pong", user: m.user, message: "valid lobby"}
    console.log("ping sucess");
    ws.send(JSON.stringify(message));
  } else {
    console.log("ping fail");
    let message: ServerMessage = {action: "pong", user: null, message: "invalid lobby"}
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
    console.log(String(((+now)-(+lobby.timeStart))));

    lobby.users.forEach(e => {
      try{
        //console.log('send message!!!')
        e.send(JSON.stringify(sm));
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
      let message: ServerMessage = {action: "error", user: null, message:"Error: Incorrect password."}
      ws.send(JSON.stringify(message));
      return null;
    }
  } else {
    // Lobby was not found
    let message: ServerMessage = {action: "error", user: null, message:"Error: Lobby not found."}
    ws.send(JSON.stringify(message));
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
    console.log("Num users: " + l.users.size);
  }
}

/* WEBSOCKET SERVER */
wss.on('connection', function connection(ws: WebSocket) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    let m: Message = JSON.parse(String(data));
    //console.log("message recived");
    //console.log(m);
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
