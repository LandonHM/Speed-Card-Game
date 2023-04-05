<script lang="ts">
  import Card from "./Card.svelte";

  export let id: number;
  export let cardData: CardData|null;
  export let moveCardId: number;
  export let toCard: number;
  export let currentCard: number;

  function dragged(ev: Event) {
    ev.preventDefault();
  }
  
  function dropped(ev: any){
    console.log('dropped');
    moveCardId = currentCard;
    toCard = id;
  }

</script>

{#if cardData}
  <div class={$$props.class + " card"} on:dragover={dragged} on:drop={dropped}>
    <Card bind:cardData on:flipped bind:currentCard />
  </div>
{:else}
  <div class={$$props.class + " placeholder"} on:dragover={dragged} on:drop={dropped} on:touchend|preventDefault|stopPropagation={dragged}>
    <p>{id}</p>
  </div>
{/if}

<style>

  .card{
    touch-action: none;
    border-radius: 100%;
    /* Invisible border so placeholder and card and the same size. */
    border: 3px dashed #00000000;
  }

  .placeholder{
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border-radius: 100%;
    border: 3px dashed black;
  }
</style>