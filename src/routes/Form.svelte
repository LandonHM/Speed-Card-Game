<script lang="ts">
  export let action: string;
</script>


<form method="POST" action={action} class={$$props.class}>
  <div class="row">
  <label>
    Username: 
    <input name="username" type="text">
  </label>
  </div>
  <div class="row">
  <label>
    Lobby name: 
    <input name="lobbyname" type="text">
  </label>
  </div>
  <div class="row">
  <label>
    Password: 
    <input name="password" type="password">
  </label>

  </div>
<div class="row">
    {#if action == "?/host"}
    <button>Host</button>
    {:else}
    <button>Connect</button>
    {/if}
    </div>
</form>

<style>
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

  label {
    float: left;
  }
</style>