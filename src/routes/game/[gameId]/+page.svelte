<script lang="ts">
    import Game from '../Game.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    //let ws: WebSocket = new WebSocket("ws://localhost:1400");
    //let message: Message = {action:"join", }
    //ws.send(S)
    console.log(data);
</script>
<h1> Data : {data.gameId}</h1>
<Game />