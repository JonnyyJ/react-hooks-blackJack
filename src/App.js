import React, {useState, useEffect, useCallback} from 'react'
import axios from 'axios'
import Card from './Card'

const api_url = 'https://deckofcardsapi.com/api'

const App = () => {
    const [deckInfo, setDeckInfo] = useState({
        deckId: '',
        playerDeck: [],
        dealerDeck: [],
    })
    const [gameOver, setGameOver] = useState(false)
    const [winner,setWinner] = useState()
    useEffect(() => {
        const gameResult = async () => {
            const playerDeckVal = await playerDeckValue()
            const dealerDeckVal = await dealerDeckValue()
            if(playerDeckVal > 21 || dealerDeckVal === 21){
                setGameOver(true)
                setWinner("Dealer Wins")
            }
            if(playerDeckVal === 21 || (dealerDeckVal > 21 && playerDeckVal < 21)){
                setGameOver(true)
                setWinner("Player Wins")
            }
            if(playerDeckVal === 21 && dealerDeckVal === 21){
                setGameOver(true)
            }
        }
        gameResult()
    })

    //start a new game
    const dealGame = useCallback(
        async () => {
        
            let response = await axios.get(`${api_url}/deck/new/shuffle/?deck_count=6`);
            let deck_id = await response.data.deck_id;
            
            let player_deck = [];
            let dealer_deck = [];
            let drawn_cards = await axios.get(`${api_url}/deck/${deck_id}/draw/?count=3`);
            player_deck.push(drawn_cards.data.cards[0]);
            player_deck.push(drawn_cards.data.cards[1]);
            dealer_deck.push(drawn_cards.data.cards[2]);
            setDeckInfo({...deckInfo, 
                deckId: deck_id,
                dealerDeck: dealer_deck,
                playerDeck: player_deck,
            });
            setWinner("")
        },[deckInfo]
    ) 

    //revert back
    const resetGame = () => {
        localStorage.clear()
        setGameOver(false)
        setWinner("")
        setDeckInfo({
            deckId:'',
            playerDeck: [],
            dealerDeck: [],
        })
    }

    //player hits 
    const playerHit = async () => {
        if(deckInfo.playerDeck.length < 5 && deckInfo.playerDeck.length !== 0){
            const response = await axios.get(`${api_url}/deck/${deckInfo.deckId}/draw/?count=1`)
            const card_data = await response.data.cards[0]
            setDeckInfo({...deckInfo, playerDeck: [...deckInfo.playerDeck, card_data]});
        }
        else {
            console.log(`Max deck length`);
        }
    }

    //player stands
    const playerStands = async () => {
      if(deckInfo.playerDeck.length !== 0){
        let cardsForDealer = deckInfo.playerDeck.length
        
        const response = await axios.get(`${api_url}/deck/${deckInfo.deckId}/draw/?count=${cardsForDealer}`)
        for(let i = 0; i < cardsForDealer - 1 ; i++) {
            let dealer_card = await response.data.cards[i];
            setDeckInfo({...deckInfo, dealerDeck: [...deckInfo.dealerDeck, dealer_card]});
        }
      }
        
    }
    //check the value of player deck after each hit.
    const playerDeckValue = async () => {
        let cardSum = 0;
        deckInfo.playerDeck.forEach(card => {
            let val = getCardVal(card)
            cardSum = cardSum + val
        })
        return cardSum
    }

    const dealerDeckValue = async () => {
        let cardSum = 0;
        deckInfo.dealerDeck.forEach(card => {
            let val = getCardVal(card)
            cardSum = cardSum + val
        })
        return cardSum
    }

    //convert the card value from string to int.
    const getCardVal = card => {
        let card_val = card.value
        if(
            card_val === 'KING' ||
            card_val === 'QUEEN' ||
            card_val === 'JACK'
        ){
            card_val = 10
        }
        else if(card_val === 'ACE'){
            card_val = 11
        }
        else {
            card_val = parseInt(card_val)
        }
        return card_val
    }

    const GameOver = ({isGameOver}) => {
        if(isGameOver === true){
            return(
                <div>
                    <p>{winner}</p>
                </div>
            )
        }
        else{
            return(<div/>)
        }
    }

    return (
        <div className="App">
            <h1 className="">Basic BlackJack</h1>
            <div className="">
                <button onClick={dealGame} disabled={gameOver}> Deal</button>
                <button onClick={playerHit} disabled={gameOver}>Hit Me</button>
                <button onClick={playerStands} disabled={gameOver}>Stand</button>
                <button onClick={resetGame}>Reset Game</button>
            </div>
            <div className="mt-3">
                <GameOver isGameOver={gameOver} className=""/>
            </div>
            <div className="deckContainer">
                <h3>Dealer: </h3>
                <div className="Cards">
                    {
                        deckInfo.dealerDeck.map(card => {
                            return( 
                                <Card key={card.code} src={card.image} alt={card.value}
                                />
                            )
                        })
                    }
                </div>
            </div>
            <div className="deckContainer">
                <h3>Player: </h3>
                <div className="Cards">
                    {
                        deckInfo.playerDeck.map(card => {
                            return(
                                <Card key={card.code} src={card.image} alt={card.value}
                              />
                            )
                        })
                    }
                </div>
            </div>  
        </div>
    )
}

export default App
