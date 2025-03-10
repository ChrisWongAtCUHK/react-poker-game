import React from 'react'

function Credits({ title, value }) {
  return (
    <div
      className={['credits', title.length > 7 ? 'credits--wide' : ''].join(' ')}
    >
      <div className='hud-title'>{title}</div>
      <div className='credits__amount'>{value}</div>
    </div>
  )
}

export default Credits
