<script lang="ts">
    import Game from '../Game.svelte';
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

    export let data: Message;
    let started: boolean = false;
    let host: boolean = false;
    let win: boolean = false;
    let lost: boolean = false;
    let winner: String;
    let users: string[];
    let m: Message;
    let solution: CardData[];
    
    // Websocket section
    let message = data;
    let user = message.user;
    users = [String(user)];
    let password = message.password;
    let lobbyname = message.lobbyname;
    let socket: WebSocket;
    onMount(async () => {
        socket = new WebSocket("ws://localhost:1400");
        socket.onmessage = (sm) => {
            //console.log(sm);
            let m: ServerMessage = JSON.parse(String(sm.data));
            console.log(m);
            switch(m.action) {
                case('userlist'): users = JSON.parse(String(m.message)); break;
                case('join'): users.push(String(m.user)); users = users; break;
                case('win'): lost = true; winner = m.user; break;
                case('start'): solution = JSON.parse(String(m.message)); started = true; break;
            }
        }
        if(message.action == "pinghost") {
            message.action = "host";
            host = true;
            socket.onopen = () => sendM(socket, message);
        } else if (message.action == "ping") {
            message.action = "connect";
            host = false;
            socket.onopen = () => sendM(socket, message);
        }
    })

    function sendM(socket: WebSocket, m: Message) {
        console.log('sending');
        socket.send(JSON.stringify(m));
    }

    // Local section
    /*$: {
        win;
        console.log('win');
        sendWin();
    }*/
    function sendWin() {
        m = {action: "win", user: user, password: password, lobbyname: lobbyname, message: "win!"};
        sendM(socket, m);
    }

    function startGame() {
        m = {action: "start", user: user, password: password, lobbyname: lobbyname, message: 'starting'};
        sendM(socket, m);
        // start game here
    }
    
</script>
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
    <p1>YOU WIN</p1>
    {:else if lost}
    <p1>YOU LOST {winner} WON</p1> 
    {/if}
    <Game solution={solution} bind:win />
{/if}