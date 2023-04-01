<script lang="ts">

  export let cards: CardData[] = [];

</script>

<div class="row">
  <div class="grid-container">
    {#each cards as {front,back,flipped}}
    <div class="grid-item">
      <div class="card">
        {#if !flipped}
        <img src={"/cards/" + front + ".png"} draggable="false" alt="">
        {:else}
        <img src={"/cards/" + back + ".png"} draggable="false" alt="">
        {/if}
      </div>
    </div>
    {/each}
  </div>
</div>

<style>

.grid-container {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  display: grid;
  grid-template-columns: repeat(3,100px);
  gap: 10px;
  row-gap: 2px;
  background-color: #1c5a91;
  padding: 10px;
  border-radius: 10px;
  border: 3px solid black;
}

.grid-container :global(.grid-item){
  /* background-color: rgba(255, 255, 255, 0.8); */
  margin: 5px 10px;
  place-self: center;
  font-size: 30px;
  text-align: center;
  width: 96px; 
  height: 96px;
}

img {
    object-fit:fill;
    width: 100%;
    height: 100%;
  }

.card {
  border-radius: 100%;
  border: 1px solid black;
  width: 100%;
  height: 100%;
}

</style>