<script lang="ts">
    import Game from '../Game.svelte';
    import { onMount } from 'svelte';
    import type { ActionData, PageData } from "./$types";
    import { is_empty } from 'svelte/internal';

    export let data: PageData;
    // Data for websocket communcation and setup
    let message: Message = data as Message;
    let host: boolean = false;
    let started: boolean = false;
    let connected: boolean = false;
    let conerror: boolean = false;
    let m: Message;
    let socket: WebSocket;
    let user: String;
    let password: String;
    let uuid: String;
    let lobbyname: String;
    let waiting: boolean = false;

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
        if(!isEmpty(data)) {
            console.log('message is not undefined');
            user = message.user;
            password = message.password;
            uuid = message.message;
            lobbyname = message.lobbyname;
            waiting = true;
            if(message.action == "pinghost") {
                message.action = "host";
                socket.onopen = () => sendM(socket, message!);
            } else if (message.action == "connect") {
                socket.onopen = () => sendM(socket, message!);
            }
        }
        console.log('onmessageing');
        socket.onmessage = (sm) => {
            let m: ServerMessage = JSON.parse(String(sm.data));
            switch(m.action) {
                case('userlist'): waiting = false; connected = true; users = JSON.parse(String(m.message)); users.push(String(user)); users = users; break;
                case('join'): users.push(String(m.user)); users = users; break;
                case('win'): 
                    console.log(win);
                    console.log(m.message);
                    time = Number(m.message);
                    if(!win) { lost = true; winner = m.user }; 
                    break;
                case('start'): solution = JSON.parse(String(m.message)); started = true; win = false; break;
                case('hostreconnect'): users = JSON.parse(String(m.message)); host = true; connected = true; waiting = false; break;
                case('created'): users = [String(user)]; host = true; connected = true; waiting = false;  break;
                case('conerr'): conerror = true; waiting = false; connected = false; break;
            }
        }
    })

    function isEmpty(obj: any) {
        for(var i in obj) return false;
        return true;
    }

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
        m = {action: "win", user: user, password: password, lobbyname: lobbyname, message: "win!"};
        sendM(socket, m);
    }

    function startGame() {
        m = {action: "start", user: user, password: password, lobbyname: lobbyname, message: uuid};
        sendM(socket, m);
        // start game here
    }
    
</script>
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
      <div class="row">
        <label>
        Password: 
        <input name="password" type="password">
        </label>
      </div>
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