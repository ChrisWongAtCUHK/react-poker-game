import { useEffect, useState, useCallback, useRef } from 'react'
import { gsap, TimelineLite } from 'gsap'
import './App.less'
import Credits from './components/Credits'
function App() {
  gsap.registerPlugin(TimelineLite)
  const payLines = {
    ROYAL_FLUSH: 'ROYAL_FLUSH',
    STRAIGHT_FLUSH: 'STRAIGHT_FLUSH',
    FOUR_OF_A_KIND: 'FOUR_OF_A_KIND',
    FULL_HOUSE: 'FULL_HOUSE',
    FLUSH: 'FLUSH',
    STRAIGHT: 'STRAIGHT',
    THREE_OF_A_KIND: 'THREE_OF_A_KIND',
    TWO_PAIR: 'TWO_PAIR',
    PAIR: 'PAIR',
  }

  const payTable = [
    { id: payLines.PAIR, name: 'Jacks or Better', multiplier: 1 },
    { id: payLines.TWO_PAIR, name: '2 Pair', multiplier: 2 },
    { id: payLines.THREE_OF_A_KIND, name: '3 of a Kind', multiplier: 3 },
    { id: payLines.STRAIGHT, name: 'Straight', multiplier: 4 },
    { id: payLines.FLUSH, name: 'Flush', multiplier: 5 },
    { id: payLines.FULL_HOUSE, name: 'Full House', multiplier: 8 },
    { id: payLines.FOUR_OF_A_KIND, name: '4 of a Kind', multiplier: 25 },
    { id: payLines.STRAIGHT_FLUSH, name: 'Straight Flush', multiplier: 50 },
    { id: payLines.ROYAL_FLUSH, name: 'Royal Flush', multiplier: 250 },
  ]

  const gameStates = {
    READY: 'READY',
    DEALING: 'DEALING',
    SWAP: 'SWAP',
    SWAPPING: 'SWAPPING',
  }

  const array_5 = [1, 2, 3, 4, 5]
  const array_13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  const object_52 = {}
  const [payLine, setPayLine] = useState(null)
  const [bet, setBet] = useState(0)
  const [gameState, setGameState] = useState(gameStates.READY)
  const [loaded, setLoaded] = useState(false)
  const [winnings, setWinnings] = useState(0)
  const [credits, setCredits] = useState(100)
  const [selected, setSelected] = useState([])
  const [hand, setHand] = useState([])
  const [deck, setDeck] = useState([])
  const [dead, setDead] = useState([])
  const [cards, setCards] = useState([])

  Array.from(Array(13).keys()).forEach((number) => {
    Array.from(Array(4).keys()).forEach((suit) => {
      object_52[`${number}-${suit}`] = null
    })
  })
  const cardsRef = useRef(object_52)

  function shuffleDeck(deck) {
    const shuffleArray = (arr) =>
      arr
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)

    return shuffleArray(deck)
  }

  const initializeDeck = useCallback(() => {
    const deck = []
    Array.from(Array(13).keys()).forEach((number) => {
      Array.from(Array(4).keys()).forEach((suit) => {
        deck.push([number, suit])
      })
    })
    setDeck(() => [...shuffleDeck(deck)])
  }, [])

  function placeBet(amount) {
    let total = bet + amount
    if (total > 5) {
      total = 5
    }
    if (total < 0) {
      total = 0
    }
    setBet(() => total)
  }

  function canDraw() {
    return (
      (gameState === gameStates.READY || gameState === gameStates.SWAP) &&
      bet > 0
    )
  }

  function playHand() {
    setCredits((pre) => pre - bet)
    setWinnings(() => 0)
    setPayLine(() => null)
  }

  function addCardToHand(card, index, newCards) {
    setTimeout(() => {
      const elem = { ...cardsRef.current }[`${card[0]}-${card[1]}`]
      if (elem) {
        const end = 200 * index + 20 * index
        console.log(end)
        const timeline = new TimelineLite({
          onComplete: () => {
            if (newCards.length < 5) {
              dealCard()
              return
            }
            if (gameState === gameStates.DEALING) {
              setGameState(() => gameStates.SWAP)
              return
            }
            if (gameState === gameStates.SWAPPING) {
              // finalizeHand()
            }
          },
        })
        const startZ = 51 //Math.ceil(this.deck.length/4)*4;
        timeline.set(elem, { x: 1180, z: startZ, rotateY: 180, opacity: 1 })
        timeline
          .to(elem, 0.2, { z: startZ + 150 })
          .to(elem, 0.6, { x: end, rotateY: 0, z: 0 })
      }
    }, 1)
  }

  function dealCard() {
    let tmpDeck = [...deck]
    if (!deck.length) {
      tmpDeck = [...shuffleDeck(dead)]
      setDeck(() => [...tmpDeck])
      setDead(() => [])
    }
    const card = tmpDeck.splice(0, 1)[0]
    const newHand = [...hand, card]

    setHand((pre) => newHand)
    setDeck(() => [...tmpDeck])
    const newCards = [...cards, { card, selected: false }]
    setCards((pre) => newCards)

    addCardToHand(card, newHand.length - 1, newCards)
  }

  function deal() {
    if (gameState === gameStates.READY) {
      setSelected(() => [])
      setGameState(() => gameStates.DEALING)
      playHand()
      if (hand.length) {
      } else {
        dealCard()
      }
    }
  }

  function selectCard(i) {
    if (gameState === gameStates.SWAP) {
      setCards((pre) => {
        const newCars = [...pre]
        newCars[i].selected = !newCars[i].selected
        return newCars
      })
    }
  }

  useEffect(() => {
    const cards = new Image()
    cards.onload = () => {
      setLoaded(() => true)
    }
    cards.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1443237/cards.png'
    const back = new Image()
    back.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1443237/back.png'

    if (!deck.length) {
      initializeDeck()
    }
  }, [deck.length, initializeDeck])

  return (
    <div className='game'>
      <div className='game__display'>
        <div className='score-table'>
          <div className='hud-title'>Score Table</div>
          <div className='score-table__line'>
            <div className='score-table__line__name'>Bet</div>
            {array_5.map((n) => {
              return (
                <div key={n} className='score-table__line__pay'>
                  {n}
                </div>
              )
            })}
          </div>
          {payTable
            .slice()
            .reverse()
            .map((line, i) => {
              return (
                <div
                  key={i}
                  className={[
                    'score-table__line',
                    line.id === payLine ? 'score-table__line--win' : '',
                  ].join(' ')}
                >
                  <div className='score-table__line__name'>{line.name}</div>
                  {array_5.map((n) => {
                    return (
                      <div key={n} className='score-table__line__pay'>
                        {line.multiplier * n}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          <div></div>
        </div>
        <div className='hud'>
          <div>Slot Poker</div>
          <Credits title='Winnings' value={winnings}></Credits>
          <Credits title='Credits' value={credits}></Credits>
          {loaded ? (
            <div className='controls'>
              <div className='bet'>
                <div className='hud-title'>Bet</div>
                <div>
                  <span className='bet__button'>
                    <button
                      type='button'
                      onClick={() => placeBet(-1)}
                      disabled={gameState !== gameStates.READY}
                      className={
                        gameState !== gameStates.READY
                          ? 'bet__button--disabled'
                          : ''
                      }
                    >
                      -
                    </button>
                  </span>
                  <div className='bet__amount'>{bet}</div>
                  <span className='bet__button'>
                    <button
                      type='button'
                      onClick={() => placeBet(1)}
                      disabled={gameState !== gameStates.READY}
                      className={
                        gameState !== gameStates.READY
                          ? 'bet__button--disabled'
                          : ''
                      }
                    >
                      +
                    </button>
                  </span>
                </div>
              </div>
              <button
                className={[
                  'deal-button',
                  canDraw() ? 'deal-button-can-draw' : '',
                ].join(' ')}
                type='button'
                onClick={deal}
                disabled={!canDraw()}
              >
                Deal
              </button>
            </div>
          ) : (
            <div className='loading'>
              Loading <span className='dots'>.</span>
              <span className='dots'>.</span>
            </div>
          )}
        </div>
      </div>

      <div className='game__main'>
        <div className='hand'>
          {cards.map((card, i) => {
            return (
              <div
                onClick={() => selectCard(i)}
                className={['hand__card', card.selected ? 'selected' : ''].join(
                  ' '
                )}
                key={`${card.card[0]}-${card.card[1]}`}
                ref={(el) => {
                  cardsRef.current[`${card.card[0]}-${card.card[1]}`] = el
                }}
              >
                <div className='card'>
                  <div className='card__back'></div>
                  <div
                    className={`card__front card-${card[0]}-${card[1]}`}
                    rel='preload'
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
        <div className='deck'>
          {array_13.map((key) => {
            return <div key={key}></div>
          })}
        </div>
      </div>
    </div>
  )
}

export default App
