<script lang="ts">
  import { fade, blur, fly, slide, scale, draw, crossfade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let cardData: CardData;
  export let currentCard: number;
  const dispatch = createEventDispatcher();

  function toggle(e: MouseEvent){
    cardData.flipped = !cardData.flipped;
    dispatch('flipped');
    e.stopPropagation();
    e.preventDefault();
  }

  function editEvent(ev: any) {
    //console.log('edite');
    currentCard = cardData.id;
    //ev.dataTransfer.clearData();
    //ev.dataTransfer.setData("text/plain",cardData.id);
  }

  function touched(ev: any) {
    //console.log('toucehd');
    currentCard = cardData.id;
  }

  function dragEvent(ev: DragEvent) {
    //this.style.translate3d(ev.pageX, ev.pageY, 0);
    //console.log(`translate3d(${ev.clientX}px, ${ev.clientY}px, 0px)`);
    //this.style.transform = `translate3d(${ev.clientX}px, ${ev.clientY}px, 0px)`;
    //ev.target.
    //this.style.translate3d(ev.pageX, ev.pageY, 0);

  //transform: translate3d(-449px, -1px, 0px); touch-action: none;
  }

</script>

<div draggable="true" on:drag={dragEvent} on:dragstart={editEvent} on:dblclick={toggle} on:touchstart={touched} >
  {#if !cardData.flipped}
  <img src={"/cards/" + cardData.front + ".png"} draggable="false" alt="">
  {:else}
  <img src={"/cards/" + cardData.back + ".png"} draggable="false" alt="">
  {/if}
</div>

<style>
  img {
    object-fit:fill;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  div {
    border-radius: 100%;
    border: 1px solid black;
    width: 100%;
    height: 100%;
  }

</style>