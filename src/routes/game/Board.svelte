<script lang="ts">

  import CardPlace from './CardPlace.svelte'

  export let deck: CardData[];
  export let cards: (CardData|null)[];
  export let solution: CardData[];
  export let win: boolean;
  export let currentCard: number;

  let moveCardId: number;
  let toCard: number = -1;

  $: moveCard(toCard)

  function moveCard(num: Number) {
    if(moveCardId == -1 || toCard == -1)
      return
    moveCardId = Number(moveCardId)
    if(!inCards(moveCardId)){
      if(cards[toCard] == null){
        cards[toCard] = deck.pop()!;
      }else{
        let temp = cards[toCard];
        cards[toCard] = deck.pop()!;
        deck.push(temp!);
      }
      cards = cards;
      deck = deck;
    }else{
      // find the place the card is in now, then swap
      let i = findCard(Number(moveCardId));
      let j = toCard;
      let temp: CardData = cards[i]!;
      cards[i] = cards[j];
      cards[j] = temp;
    }
    //checkWin here
    checkWin()
    toCard = -1;
  }

  function findCard(id: number) {
    let i = cards.findIndex((n) => n != null && n.id == id);
    return i;
  }

  function inCards(id: number) {
    return findCard(id) >= 0;
  }

  function checkWin(){
    //console.log("checking for win!");
    for(let i = 0; i < cards.length; i++){
      if(cards[i] == null)
        return
      if( !sameCard(i) )
        return
    }
    win = true;
  }

  function sameCard(i: number){
    let s1 = solution[i].flipped ? solution[i].back : solution[i].front;
    let s2 = cards[i]!.flipped ? cards[i]!.back : cards[i]!.front;
    return s1 === s2;
  }

</script>


<div class="center">
  <div class="grid-container">
    {#each cards as cardData,i}
    <CardPlace class="grid-item" id={i} bind:cardData bind:toCard bind:moveCardId bind:currentCard on:flipped={checkWin} />
    {/each}
  </div>
</div>

<style>

.grid-container {
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
  margin: 2px;
  place-self: center;
  font-size: 30px;
  text-align: center;
  width: 96px; 
  height: 96px;
}

</style>