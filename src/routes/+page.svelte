<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  export let data: PageData;
  export let form: ActionData;
  console.log(form);
  //console.log(data);
</script>

<form method="POST" action="?/login">
  <div class="row">
  <label>
    Username
    <input name="username" type="text">
  </label>
  </div>
  <div class="row">
  <label>
    Lobby name
    <input name="lobbyname" type="text">
  </label>
  </div>
  <div class="row">
  <label>
    Password
    <input name="password" type="password">
  </label>

  </div>
<div class="row">
    <button>Log in</button>
    </div>
</form>

{#if !form?.success && data.lobbyname}
<p>{data.lobbyname} not found.</p>
{/if}