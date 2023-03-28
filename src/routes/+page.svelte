<script lang="ts">
  import Form from './Form.svelte';
  import type { ActionData, PageData } from "./$types";
  export let data: PageData;
  export let form: ActionData;
  //console.log(form);
  //console.log(data);
  let host = data.host === 'true';
</script>

<div class='box'>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class='row'>
    <div class='host' on:click={(e) => {host = true}}>
      <p>Host</p>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class='connect' on:click={(e) => {host = false}}>
      <p>Connect</p>
    </div>
  </div>
  <div class='row'>
    {#if host}
    <Form action="?/host" class="host"/>
    {:else}
    <Form action="?/connect" class="connect"/>
    {/if}
  </div>
</div>
{#if !form?.success && data.lobbyname}
<p>{data.lobbyname} not found.</p>
{/if}

<style>
  .box {
    display: inline;
    background-color: aqua;
    width: auto;
  }
  .host {
    border-color: black;
    background-color: green;
    border-style: solid;
  }

  .connect {
    border-color: black;
    background-color: tan;
    border-style: solid;
  }
</style>