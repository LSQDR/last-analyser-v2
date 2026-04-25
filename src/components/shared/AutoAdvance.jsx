// Shows a countdown and auto-calls onComplete when it reaches 0.
// Clicking the button skips the wait immediately.

import { useEffect, useRef, useState } from 'react'
import './AutoAdvance.css'

export function AutoAdvance({ onComplete, seconds = 8, label = 'Continue' }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef   = useRef(null)
  const onCompleteRef = useRef(onComplete)          

  useEffect(() => {
    onCompleteRef.current = onComplete              
  }, [onComplete])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (remaining === 0) {
      onCompleteRef.current?.()                     
    }
  }, [remaining])                                  

  function handleClick() {
    clearInterval(intervalRef.current)
    onCompleteRef.current?.()                       
  }

  const progress = ((seconds - remaining) / seconds) * 100

  return (
    <div className="auto-advance">
      <button className="auto-advance-btn" onClick={handleClick}>
        {label}
      </button>
      <div className="auto-advance-track" role="progressbar"
        aria-valuenow={remaining} aria-valuemin={0} aria-valuemax={seconds}
        aria-label={`Continuing automatically in ${remaining} seconds`}>
        <div className="auto-advance-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="auto-advance-label">Continuing in {remaining}s — or click to skip</p>
    </div>
  )
}
