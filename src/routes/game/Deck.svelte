<script lang="ts">

  import Card from './Card.svelte'

  export let cards: CardData[] = [];
  export let currentCard: number;

</script>

<div class="stack">
  {#if cards.length > 0}
    {#each cards as cardData}
    <div class="card-box">
      <Card bind:cardData bind:currentCard />
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
    width: 96px;
    height: 96px;
  }

</style>