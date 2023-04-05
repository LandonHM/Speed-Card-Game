<script lang="ts">

  import Board from './Board.svelte'
  import Deck from './Deck.svelte'
  import Solution from './Solution.svelte';


  // Deck start full
  let deck: CardData[] = [
    {id: 0, flipped: false, front: "blueberry", back: "peach"},
    {id: 1, flipped: false, front: "blueberry", back: "apple"},
    {id: 2, flipped: false, front: "blueberry", back: "lemon"},
    {id: 3, flipped: false, front: "peach", back: "orange"},
    {id: 4, flipped: false, front: "peach", back: "cherry"},
    {id: 5, flipped: false, front: "apple", back: "lemon"},
    {id: 6, flipped: false, front: "apple", back: "orange"},
    {id: 7, flipped: false, front: "lemon", back: "cherry"},
    {id: 8, flipped: false, front: "orange", back: "cherry"},
  ];

  // Cards starts empty
  let cards: (CardData|null)[] = [
    null, null, null,
    null, null, null,
    null, null, null,
  ];

  export let solution: CardData[] = [];
  /*let solution: CardData[] = [
    {id: 0, flipped: false, front: "blueberry", back: "peach"},
    {id: 1, flipped: false, front: "blueberry", back: "apple"},
    {id: 2, flipped: false, front: "blueberry", back: "lemon"},
    {id: 3, flipped: false, front: "peach", back: "orange"},
    {id: 4, flipped: false, front: "peach", back: "cherry"},
    {id: 5, flipped: false, front: "apple", back: "lemon"},
    {id: 6, flipped: false, front: "apple", back: "orange"},
    {id: 7, flipped: false, front: "lemon", back: "cherry"},
    {id: 8, flipped: false, front: "orange", back: "cherry"},
  ];*/
  //shuffle(solution);

  shuffle(deck);

  function shuffle(array: CardData[]) {
    for(let i = array.length-1; i > 0; i--){
      const j = Math.floor(Math.random() * (i+1));
      [array[i], array[j]] = [array[j],array[i]];
    }
    for(let i = 0; i < array.length; i++){
      if(Math.floor(Math.random() * 2) == 0){
        array[i].flipped = true;
      }
    }
  }

  export let win: boolean;
  let currentCard: number;

</script>

<Solution cards={solution}/>
<Deck cards={deck} bind:currentCard />
<Board bind:cards bind:deck solution={solution} bind:currentCard bind:win/>
