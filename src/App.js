import { useState } from 'react'
import './App.less'

function App() {
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

  const array_5 = [1, 2, 3, 4, 5]

  const [payLine, setPayLine] = useState(null)

  return (
    <div className='game'>
      <div className='game__display'>
        <div className='score-table'>
          <div className='hud-title'>Score Table</div>
          <div className='score-table__line'>
            <div className='score-table__line__name'>Bet</div>
            {array_5.map((n) => {
              return <div key={n} className='score-table__line__pay'>{n}</div>
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
      </div>
    </div>
  )
}

export default App
