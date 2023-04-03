<script lang="ts">
    import Game from '../Game.svelte';
    import { onMount } from 'svelte';
    import type { PageData } from "./$types";
    import { dev } from '$app/environment';

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
    let url: string;

    // Data for game function
    let win: boolean = false;
    let lost: boolean = false;
    let winner: string;
    let users: string[];
    let solution: CardData[];
    let time: number;

    // Websocket functionality
    onMount(async () => {
        url = window.location.href;
        // If there is no message, then the user needs to connect.
        if(dev) {
            socket = new WebSocket("ws://localhost:1400");
        } else {
            socket = new WebSocket("wss://kanji.help:1400");
        }
        socket.onmessage = (sm) => {
            let m: ServerMessage = JSON.parse((sm.data));
            //console.log(m);
            switch(m.action) {
                // Lists lobby members
                case('userlist'): waiting = false; connected = true; users = JSON.parse(m.message); users = users; break;
                case('join'): users.push(m.user); users = users; break;
                // Game returnds
                case('reset'): win = false; lost = false; started = false; break;
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

    let over: boolean; 
    $: over = win || lost;

    function wingame() {
        win = true;
    }

    function sendWin() {
        m = {action: "win", user: user, password: password, lobbyname: lobbyname!, id: uuid};
        sendM(socket, m);
    }

    function backToLobby() {
        m = {action: "reset", user: user, password: password, lobbyname: lobbyname!, id: uuid};
        sendM(socket, m);
    }

    function startGame() {
        m = {action: "start", user: user, password: password, lobbyname: lobbyname!, id: uuid};
        win = false; lost = false; 
        sendM(socket, m);
    }
    
    function copyLink() {
        navigator.clipboard.writeText(url);
    }
    
</script>

{#if !validLobby}
    <div class='center top'>
        <div style="display: flex; flex-direction: column;">
            <h2 style="text-align:center">Could not find lobby "{lobbyname}"</h2>
            <a href="/">Click here to go to home to host your own lobby!</a>
        </div>
    </div>
{:else if waiting}
    <h2 class='center top'> Attempting to reconnect you.</h2>
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
        <div class='center top' >
            <input type="text" readonly value={url} on:click|preventDefault={copyLink}>
        </div>
        <div class='center' style='margin-top:1px'>
            <p style='margin: 0px'>Send this link for others to connect. (If you click it will automatically copy)</p>
        </div>
        <div class='center'>
            <div class='box' style="margin-right: 10px">
                <h2 style="margin: 20px 5px 5px 5px; text-align: center;">How to play</h2>
                <p style='max-width: 250px; margin: 5px; max-height: 80vh; max-height: 80dvh; overflow-y: auto;'>
                    The game is made up of three components. The left (or top if screen is portrait mode) is the solution,
                    The middle is your 'deck', and the right (or bottom in portrait) is your board.
                    The goal of the game is to make your board match the solution as fast as possible.
                    Your deck is made up of cards which have two sides.
                    You interact with the deck by dragging the cards from your deck onto the places on your board.
                    The cards regardless of where they are can be double clicked (or doubled tapped) to flip then and show their other side.
                    Once cards are on the board you can drag them on top of each other to swap their places.
                </p>
            </div>
            <div class='lobbybox'>
                <div class='lobbydiv'>
                    <h2>Users Connected:</h2>
                </div>
                <div class='lobbydiv lobby'>
                    {#each users as user}
                        <p class='user'>{user}</p>
                    {/each}
                </div>
                {#if host} 
                    <div class='center'>
                        <button on:click={startGame}> Start game</button>
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        {#if over}
            <div class='center top'>
                <div class='box'>
                    {#if win}
                        <h2 style="padding: 10px">YOU WON IN {time / 1000} SECONDS</h2>
                    {:else}
                        <h2 style="padding: 10px">YOU LOST, {winner} WON IN {time / 1000} SECONDS</h2> 
                    {/if}
                    {#if host}
                        <div class='center'>
                            <button on:click={backToLobby} style='padding: 5px'>Back to lobby</button>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="wrapper">
                <div class='game'>
                    <Game solution={solution} bind:win />
                </div>
            </div>
        {/if}
    {/if}
{/if}

<style>
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50%;
  }

  .game {
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* background-color: yellow; */
    justify-content: center;
    align-items: center;
  }

  @media (orientation: landscape){
    .game {
      /* background-color: green; */
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
    padding: 5px 5px 5px 10px;
    font-size: large;
  }

  .lobby {
    max-height: 515px;
    overflow-y: auto;
  }

  .user {
    padding-top: 0px;
    padding-bottom: 5px;
    margin: 0px;
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
    justify-content: center;
    border-radius: 10px;
  }

  .lobbybox {
    display: grid;
    background-color: rgb(48, 119, 119);
    justify-content: center;
    grid-template-rows: auto 1fr auto;
    border-radius: 10px;
  }

  button {
    font-size: large;
    margin: 10px 5px;
    border-radius: 10px;
    align-self: center;
  }
</style>