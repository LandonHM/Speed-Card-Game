<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  export let data: PageData;
  export let form: ActionData;
  //console.log(form);
  //console.log(data);
</script>

<div class='box'>
  <div class='row'>
    <form method="POST">
      <div class="row">
        <label>
        Username: 
        <input name="username" type="text">
        </label>
      </div>
      <div class="row">
        <label>
        Use random lobby name.
        <input name="hasName" type="checkbox">
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
        Password protected.
        <input name="hasPass" type="checkbox">
        </label>
      </div>
      <div class="row">
        <label>
        Password: 
        <input name="password" type="password">
        </label>
      </div>
      <div class="row">
        <button>Host</button>
      </div>
    </form>
  </div>
</div>

{#if !form?.success && data.lobbyname}
<p>{data.lobbyname} was already taken.</p>
{/if}

<style>
  .box {
    display: inline;
    background-color: aqua;
    width: auto;
  }
</style>