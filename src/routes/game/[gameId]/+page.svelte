<script lang="ts">
    import Game from '../Game.svelte';
    import { onMount } from 'svelte';
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    // Data for websocket communcation and setup
    let message: Message = data as Message;
    let host: boolean = false;
    let started: boolean = false;
    let connected: boolean = false;
    let conerror: boolean = false;
    let socket: WebSocket;
    let user: String;
    let password: String;
    let uuid: String;
    let lobbyname: String|undefined = data.lobby;
    let waiting: boolean = false;
    let validLobby: boolean = true;
    let m: Message = {action: "ping", user: "", lobbyname: lobbyname == undefined ? message.lobbyname : lobbyname, password: "", message: ""};
    let passwordReq: boolean = true;

    // Data for game function
    let win: boolean = false;
    let lost: boolean = false;
    let winner: String;
    let users: string[];
    let solution: CardData[];
    let time: number;

    // Websocket functionality
    onMount(async () => {
        // If there is no message, then the user needs to connect.
        socket = new WebSocket("ws://localhost:1400");
        socket.onmessage = (sm) => {
            let m: ServerMessage = JSON.parse(String(sm.data));
            //console.log(m);
            switch(m.action) {
                // Lists lobby members
                case('userlist'): waiting = false; connected = true; users = JSON.parse(String(m.message)); users.push(String(user)); users = users; break;
                case('join'): users.push(String(m.user)); users = users; break;
                // Game returnds
                case('win'): 
                    console.log(win);
                    console.log(m.message);
                    time = Number(m.message);
                    if(!win) { lost = true; winner = m.user }; 
                    break;
                case('start'): solution = JSON.parse(String(m.message)); started = true; win = false; break;
                // Host connting returns
                case('hostreconnect'): users = JSON.parse(String(m.message)); host = true; connected = true; waiting = false; break;
                case('created'): users = [String(user)]; host = true; connected = true; waiting = false;  break;
                // Incorrect password
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
            uuid = message.message;
            lobbyname = message.lobbyname;
            waiting = true;
            if(message.action == "pinghost") {
                message.action = "host";
            }
            socket.onopen = () => {sendM(socket, m); sendM(socket, message!);}
        } else {
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
        m = {action: "win", user: user, password: password, lobbyname: lobbyname!, message: "win!"};
        sendM(socket, m);
    }

    function startGame() {
        m = {action: "start", user: user, password: password, lobbyname: lobbyname!, message: uuid};
        sendM(socket, m);
        // start game here
    }
    
</script>
{#if !validLobby}
<p>Lobby not found sry!</p>
<a href="/">Click here to go to home to host your own lobby!</a>
{:else}
{#if waiting}
<p> Attempting to reconnect you.</p>
{:else if !host && !connected}
    <p>Connect plz</p>
    <form method="POST">
      <div class="row">
        <label>
        Username: 
        <input name="username" type="text">
        </label>
      </div>
      {#if passwordReq}
      <div class="row">
        <label>
        Password: 
        <input name="password" type="password">
        </label>
      </div>
      {/if}
      <div class="row">
        <button>Connect</button>
      </div>
    </form>
    {#if conerror}
    <p>There was an error trying to connect you</p>
    {/if}
{:else}
    {#if !started}
        <div>
            <h2>Uesrs Conncete:</h2>
        </div>
        <div>
        {#each users as user}
            <p>{user}</p>
        {/each}
        </div>
        {#if host} 
            <button on:click={startGame}> Start game</button>
        {/if}
    {:else}
        {#if win}
        <p1>YOU WON IN {time / 1000} SECONDS</p1>
        {:else if lost}
        <p1>YOU LOST {winner} WON IN {time / 1000} SECONDS</p1> 
        {/if}
        <Game solution={solution} bind:win />
    {/if}
{/if}
{/if}