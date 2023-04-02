<script lang="ts">
    import Game from '../Game.svelte';
    import { onMount } from 'svelte';
    import type { PageData } from "./$types";

    export let data: PageData;
    // Data for websocket communcation and setup
    let message: Message = data as Message;
    let host: boolean = false;
    let started: boolean = false;
    let connected: boolean = false;
    let conerror: boolean = false;
    let socket: WebSocket;
    let user: string;
    let password: string;
    let uuid: string;
    let lobbyname: string|undefined = data.lobby;
    let waiting: boolean = false;
    let validLobby: boolean = true;
    let m: Message = {action: "ping", user: "", lobbyname: lobbyname == undefined ? message.lobbyname : lobbyname, password: "", id: ""};
    let passwordReq: boolean = true;

    // Data for game function
    let win: boolean = false;
    let lost: boolean = false;
    let winner: string;
    let users: string[];
    let solution: CardData[];
    let time: number;

    // Websocket functionality
    onMount(async () => {
        // If there is no message, then the user needs to connect.
        //socket = new WebSocket("wss://kanji.help:1400");
        socket = new WebSocket("ws://localhost:1400");
        socket.onmessage = (sm) => {
            let m: ServerMessage = JSON.parse((sm.data));
            //console.log(m);
            switch(m.action) {
                // Lists lobby members
                case('userlist'): waiting = false; connected = true; users = JSON.parse(m.message); users = users; break;
                case('join'): users.push(m.user); users = users; break;
                // Game returnds
                case('win'): 
                    //console.log(win);
                    //console.log(m.message);
                    time = Number(m.message);
                    if(!win) { lost = true; winner = m.user }; 
                    break;
                case('start'): solution = JSON.parse(m.message); started = true; win = false; lost = false; break;
                // Host connting returns
                case('hostreconnect'): users = JSON.parse(m.message); host = true; connected = true; waiting = false; break;
                case('created'): users = [user]; host = true; connected = true; waiting = false;  break;
                // Incorrect password
                case('error'): 
                case('conerr'): conerror = true; waiting = false; connected = false; break;
                // Lobby ping returnds
                case('pong'): 
                    switch(m.message) {
                        case('nopassword'): passwordReq = false; break;
                        case('yespassword'): passwordReq = true; break;
                        case('nolobby'): validLobby = false; break;
                    } break;
            }
        }
        if(lobbyname == undefined) {
            console.log('message is not undefined');
            user = message.user;
            password = message.password;
            uuid = message.id;
            lobbyname = message.lobbyname;
            waiting = true;
            if(message.action == "pinghost") {
                message.action = "host";
                // dont have to ping lobby cause create lobby will fail
                socket.onopen = () => {sendM(socket, message!);}
            } else {
                // I ping to see if the lobby is still valid (if they have an old cookie)
                socket.onopen = () => {sendM(socket, m); sendM(socket, message!);}
            }
        } else {
            // if lobbyname is not undefined that means the user is not logged in, so just ping to see if there is a lobby and/or if there is a required password
            socket.onopen = () => sendM(socket,m);
        }
    })

    function sendM(socket: WebSocket, m: Message) {
        console.log('sending');
        socket.send(JSON.stringify(m));
    }

    // Local section
    $: {
        //console.log('win updated ' + win + " or started updated " + started);
        if(win && started){
            //console.log('win');
            sendWin();
        }
    }

    function wingame() {
        win = true;
    }

    function sendWin() {
        m = {action: "win", user: user, password: password, lobbyname: lobbyname!, id: uuid};
        sendM(socket, m);
    }

    function startGame() {
        m = {action: "start", user: user, password: password, lobbyname: lobbyname!, id: uuid};
        win = false; lost = false;
        sendM(socket, m);
    }
    
</script>

{#if !validLobby}
    <div class='center' style="padding-top: 20px">
        <div style="display: flex; flex-direction: column;">
            <h2 style="text-align:center">Could not find lobby "{lobbyname}"</h2>
            <a href="/">Click here to go to home to host your own lobby!</a>
        </div>
    </div>
{:else if waiting}
    <h2 class='center' style="padding-top: 20px"> Attempting to reconnect you.</h2>
    <h2 class='center' > If this is taking a long time there is likely a bug. </h2>
    <h2 class='center' > Try clearing cookies on this site and reconnecting or making a new lobby</h2>
{:else if !host && !connected}
    
    <div class='center top'>
        <h2>Connect to lobby {lobbyname}</h2>
    </div>
    <div class='center'>
        <form method="POST">
            <div class='box'>
                <input placeholder="Your username" name="username" type="text">
                {#if passwordReq}
                    <input placeholder="Lobby password" name="password" type="password">
                {/if}
                <button>Connect</button>
            </div>
        </form>
    </div>
    {#if conerror}
        <h2 class='center red'> There was an error trying to connect you</h2>
    {/if}
{:else}
    {#if !started}
        <div class='center'>
            <div class='box'>
                <div class='lobbydiv'>
                    <h2>Users Connected:</h2>
                </div>
                <div class='lobbydiv'>
                    {#each users as user}
                        <p>{user}</p>
                    {/each}
                </div>
                {#if host} 
                    <button on:click={startGame}> Start game</button>
                {/if}
            </div>
        </div>
    {:else}
        {#if win}
        <div class="row">
            <p1>YOU WON IN {time / 1000} SECONDS</p1>
            {#if host}
                <div>
                    <button on:click={startGame}>New Game.</button>
                </div>
            {/if}
        </div>
        {:else if lost}
        <div class="row">
            <p1>YOU LOST {winner} WON IN {time / 1000} SECONDS</p1> 
            {#if host}
                <div>
                    <button on:click={startGame}>New Game.</button>
                </div>
            {/if}
        </div>
        {:else}
            <div class='game'>
                <Game solution={solution} bind:win />
            </div>
        {/if}
    {/if}
{/if}

<style>

  .game {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: yellow;
    justify-content: center;
    align-items: center;
  }

  @media (orientation: landscape){
    .game {
      background-color: green;
      flex-direction: row;
    }
  } 
  
  a{
    color: aqua;
  }

  .red{
    color: rgb(255, 4, 4);
  }

  .top {
    padding-top: 20px;
  }

  .lobbydiv {
    justify-self: left;
    padding: 5px 5px 5px 10px;
    font-size: large;
  }

  input {
    border-radius: 10px;
    text-align: center;
    font-size: large;
    margin: 5px 5px;
    padding: 5px;
  }

  .box {
    display: inline-grid;
    background-color: rgb(48, 119, 119);
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    border-radius: 10px;
  }

  button {
    font-size: large;
    margin: 10px 5px;
    border-radius: 10px;
    align-self: center;
  }
</style>