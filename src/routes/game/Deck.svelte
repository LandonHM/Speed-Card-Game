<script lang="ts">

  import Card from './Card.svelte'

  export let cards: CardData[];

</script>

<div class="stack">
  {#if cards.length > 0}
    {#each cards as cardData}
    <div class="card-box">
      <Card bind:cardData />
    </div>
    {/each}
  {:else}
    <div class="card-box"></div>
  {/if}

</div>

<style>

  .stack {
    display: grid;
    justify-content: center;
  }

  .card-box {
    grid-row: 1;
    grid-column: 1;
    width: 128px;
    height: 128px;
  }

</style>