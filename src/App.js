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

  function addCardToHand(card, index, cards, hand, deck, gameState) {
    setTimeout(() => {
      const elem = cardsRef.current[`${card[0]}-${card[1]}`]
      if (elem) {
        const end = 200 * index + 20 * index
        const timeline = new TimelineLite({
          onComplete: () => {
            if (cards.length < 5) {
              dealCard(cards, hand, deck, gameState)
              return
            }

            if (gameState === gameStates.DEALING) {
              setGameState(() => gameStates.SWAP)
              return
            }
            if (gameState === gameStates.SWAPPING) {
              finalizeHand(hand)
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

  function dealCard(cards, hand, deck, gameState) {
    if (!deck.length) {
      deck = [...shuffleDeck(dead)]
      setDeck(() => deck)
      setDead(() => [])
    }
    const card = deck.splice(0, 1)[0]
    const newHand = [...hand, card]

    const newCards = [...cards, { card, selected: false }]
    addCardToHand(card, newHand.length - 1, newCards, newHand, deck, gameState)

    setHand(() => [...newHand])
    setDeck(() => [...deck])
    setCards(() => [...newCards])
  }

  function finalize(hand) {
    const update = (payLine) => {
      const winnings = payTable.find((p) => p.id === payLine).multiplier * bet
      setPayLine(() => payLine)
      setWinnings(() => winnings)
      setCredits((pre) => pre + winnings)
    }

    const suits = hand.map((c) => c[1])
    const faces = hand.map((c) => c[0])

    // flush
    const hasFlush = suits.every((val, i, arr) => val === arr[0])

    // straight
    faces.sort((a, b) => a - b)

    let hasStraight = faces.every(
      (val, i, arr) => i === arr.length - 1 || val + 1 === arr[i + 1]
    )
    if (!hasStraight && !faces[0]) {
      let i = 1
      while (i < 5) {
        if (faces[i] !== i + 8) {
          break
        }
        i++
      }

      hasStraight = i === 5
    }

    // straight flush
    const hasStraightFlush = hasFlush && hasStraight

    // royal flush
    const hasRoyalFlush = hasStraightFlush && faces[4] === 12 && faces[0] === 0
    if (hasRoyalFlush) {
      update(payLines.ROYAL_FLUSH)
      return
    }

    if (hasStraightFlush) {
      update(payLines.STRAIGHT_FLUSH)
      return
    }

    // 4 of a kind
    const hasFourOfAKind = faces[0] === faces[3] || faces[1] === faces[4]
    if (hasFourOfAKind) {
      update(payLines.FOUR_OF_A_KIND)
      return
    }

    // full house
    const hasFullHouse =
      (faces[0] === faces[1] && faces[2] === faces[4]) ||
      (faces[0] === faces[2] && faces[3] === faces[4])
    if (hasFullHouse) {
      update(payLines.FULL_HOUSE)
      return
    }

    if (hasFlush) {
      update(payLines.FLUSH)
      return
    }

    if (hasStraight) {
      update(payLines.STRAIGHT)
      return
    }

    // 3 of a kind
    const hasThreeOfAKind =
      faces[0] === faces[2] || faces[1] === faces[3] || faces[2] === faces[4]
    if (hasThreeOfAKind) {
      update(payLines.THREE_OF_A_KIND)
      return
    }

    // 2 pair
    const hasTwoPair =
      (faces[0] === faces[1] && faces[2] === faces[3]) ||
      (faces[0] === faces[1] && faces[3] === faces[4]) ||
      (faces[1] === faces[2] && faces[3] === faces[4])
    if (hasTwoPair) {
      update(payLines.TWO_PAIR)
      return
    }

    // jacks or better
    const hasPair = ((arr) => {
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1] && (arr[i] > 9 || arr[i] === 0)) {
          return true
        }
      }
      return false
    })(faces)
    if (hasPair) {
      update(payLines.PAIR)
    }
  }

  function finalizeHand(hand) {
    finalize(hand)
    setGameState(() => gameStates.READY)
  }

  function moveCards(cards, hand, gameState) {
    const elems = cards.map(
      (card) => cardsRef.current[`${card.card[0]}-${card.card[1]}`]
    )
    let removed = 0
    for (let i = 0; i < cards.length; i++) {
      const timeline = new TimelineLite({
        // eslint-disable-next-line no-loop-func
        onComplete: () => {
          if (removed === elems.length - 1) {
            if (cards.length < 5) {
              dealCard(cards, hand, deck, gameState)
            }
          } else {
            removed++
          }
        },
      })
      const end = 200 * i + 20 * i
      timeline.to(elems[i], 0.6, { x: end })
    }
  }

  function removeCardFromHand(removedCards, newCards, gameState) {
    const elems = removedCards.map(
      (card) => cardsRef.current[`${card[0]}-${card[1]}`]
    )
    const timeline = new TimelineLite({
      onComplete: () => {
        const cards = newCards.map((card) => ({ card, selected: false }))
        setTimeout(() => moveCards(cards, newCards, gameState), 1)
        setCards(() => [...cards])
      },
    })
    timeline
      .to(elems, 0.2, { rotateY: 180 })
      .to(elems, 0.2, { x: 1180, delay: 0.1 })
  }

  function swap() {
    const gameState = gameStates.SWAPPING
    setGameState(() => gameState)
    const remainingCards = cards.filter((x) => x.selected).map((x) => x.card)
    const selectedCards = cards.filter((x) => !x.selected).map((x) => x.card)
    if (!selectedCards.length) {
      finalizeHand([...hand])
    }

    const tmpDead = [...dead, ...selectedCards]
    setDead(() => [...tmpDead])

    removeCardFromHand(
      hand.filter((oldCard) => !remainingCards.includes(oldCard)),
      remainingCards,
      gameState
    )
  }

  function deal() {
    if (gameState === gameStates.READY) {
      const gameState = gameStates.DEALING
      setGameState(() => gameState)
      playHand()

      if (hand.length) {
        const elems = cards.map(
          (card) => cardsRef.current[`${card.card[0]}-${card.card[1]}`]
        )
        gsap.killTweensOf(elems)
        gsap.to(elems, {
          scale: 1,
          duration: 0.2,
          onComplete: () => {
            const tmpDead = [...dead, ...hand]
            const newDeck = shuffleDeck([...deck, ...tmpDead])

            const elems = cards.map(
              (card) => cardsRef.current[`${card.card[0]}-${card.card[1]}`]
            )
            const timeline = new TimelineLite({
              onComplete: () => {
                if (
                  gameState === gameStates.SWAPPING ||
                  gameState === gameStates.DEALING
                ) {
                  setCards(() => [])
                  dealCard([], [], [...newDeck], gameState)
                }
              },
            })
            timeline
              .to(elems, 0.2, { rotateY: 180 })
              .to(elems, 0.2, { x: 1180, delay: 0.1 })

            setDead(() => [])
            setDeck(() => newDeck)
            setHand(() => [])
          },
        })
      } else {
        dealCard([], [...hand], [...deck], gameState)
      }

      return
    }
    if (gameState === gameStates.SWAP) {
      swap()
    }
  }

  function selectCard(i) {
    if (gameState === gameStates.SWAP) {
      setCards((pre) => {
        const newCards = [...pre]
        newCards[i].selected = !newCards[i].selected
        return [...newCards]
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
                    className={`card__front card-${card.card[0]}-${card.card[1]}`}
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
