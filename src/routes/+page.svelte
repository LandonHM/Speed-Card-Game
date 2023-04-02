<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  export let data: PageData;
  export let form: ActionData;
  //console.log(form);
  //console.log(data);
</script>

<div class='center top'>
  <h2>Host a lobby</h2>
</div>
<div class='center'>
  <form method="POST">
    <div class='box'>
      <input placeholder="Username" name="username" type="text">
      <label>
      Use random lobby name.
      <input name="hasName" type="checkbox">
      </label>
      <input placeholder="Lobby name" name="lobbyname" type="text">
      <label>
      Password protected.
      <input name="hasPass" type="checkbox">
      </label>
      <input placeholder="Password" name="password" type="password">
      <button>Host</button>
    </div>
  </form>
</div>

{#if !form?.success && data.error}
<h2 class='center red'>{data.error}</h2>
{/if}

<style>
  .red{
    color: rgb(255, 4, 4);
  }

  .top {
    padding-top: 20px;
  }

  label {
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