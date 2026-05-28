import { useRef, useState, useCallback } from 'react'
import { runSchedule } from '../utils/precisionTimer.js'
import { classifyClick, classifyNoResponse } from '../utils/classify/classifyCPTResponse.js'
import { computeBlockMetrics } from '../utils/compute/computeCPTBlockMetrics.js'

const INTER_BLOCK_PAUSE_MS = 4000

export function useCPTEngine(schedule, onBlockComplete, onAllBlocksComplete) {
  const activeEvent = useRef(null)
  const blockEventLog = useRef([])
  const allEventLog = useRef([])
  const blockMetrics = useRef([])
  const cancelRAF = useRef(null)
  const closeTimer = useRef(null)
  const currentBlock = useRef(0)

  const [circleState,  setCircleState] = useState('blue')
  const [isRunning,    setIsRunning] = useState(false)
  const [blockIndex,   setBlockIndex] = useState(0)
  const [isPaused,     setIsPaused] = useState(false)
  const [slowWarning,  setSlowWarning] = useState(false)

  function logEvent(event) {
    blockEventLog.current.push(event)
    allEventLog.current.push(event)
  }

  const handleEventFire = useCallback((event, fireTimestamp) => {
    activeEvent.current = { ...event, firesAt: fireTimestamp, responded: false }
    setCircleState(event.type === 'target' ? 'red' : 'blue')

    closeTimer.current = setTimeout(() => {
      const snap = activeEvent.current
      if (snap) {
        const result = classifyNoResponse(snap)
        if (result) logEvent({ ...snap, ...result, rtms: null })
      }
      setCircleState('blue')
      activeEvent.current = null
    }, 1000)
  }, [])

  const finishBlock = useCallback(() => {
    const events  = [...blockEventLog.current]
    const metrics = computeBlockMetrics(events)
    const { _meanRT, _sdRT, ...publicMetrics } = metrics
    blockMetrics.current.push({ meanRT: _meanRT, sdRT: _sdRT })
    blockEventLog.current = []
    onBlockComplete(publicMetrics, events, currentBlock.current)
  }, [onBlockComplete])

  const runBlock = useCallback((blockIdx) => {
    currentBlock.current = blockIdx
    setBlockIndex(blockIdx)
    setIsPaused(false)

    const blockSchedule = schedule.blocks[blockIdx - 1]

    const cancel = runSchedule(
      blockSchedule,
      handleEventFire,
      () => {
        cancelRAF.current = null
        finishBlock()
        if (blockIdx < schedule.blocks.length) {
          setIsPaused(true)
          setTimeout(() => runBlock(blockIdx + 1), INTER_BLOCK_PAUSE_MS)
        } else {
          setIsRunning(false)
          onAllBlocksComplete(allEventLog.current, blockMetrics.current)
        }
      }
    )
    cancelRAF.current = cancel
  }, [schedule, handleEventFire, finishBlock, onAllBlocksComplete])

  const runPractice = useCallback((onDone) => {
    const cancel = runSchedule(
      schedule.practice,
      handleEventFire,
      () => { cancelRAF.current = null; onDone() }
    )
    cancelRAF.current = cancel
  }, [schedule, handleEventFire])

  // capture event snapshot before nulling activeEvent.current
  const handleClick = useCallback(() => {
    if (!activeEvent.current) return

    const snapshot = activeEvent.current          
    const now = performance.now()
    const prevStats = blockMetrics.current.length > 0
      ? blockMetrics.current[blockMetrics.current.length - 1]
      : null

    const result = classifyClick(now, snapshot, prevStats)
    if (!result) return

    clearTimeout(closeTimer.current)
    activeEvent.current = null                   
    setCircleState('blue')

    if (result.classification === 'hit' && result.rt > 750) {
      setSlowWarning(true)
      setTimeout(() => setSlowWarning(false), 1500)
    }

    if (!result.include) return                 
    logEvent({ ...snapshot, ...result, rtms: result.rt })
  }, [])

  const startPractice = useCallback((onDone) => {
    blockEventLog.current = []
    allEventLog.current = []
    setIsRunning(true)
    runPractice(onDone)
  }, [runPractice])

  const startBlocks = useCallback(() => {
    blockEventLog.current = []
    allEventLog.current = []
    blockMetrics.current = []
    setIsRunning(true)
    runBlock(1)
  }, [runBlock])

  const cancel = useCallback(() => {
    cancelRAF.current?.()
    clearTimeout(closeTimer.current)
    setIsRunning(false)
    setCircleState('blue')
    activeEvent.current = null
  }, [])

  return {
    circleState, 
    isRunning, 
    blockIndex, 
    isPaused, 
    slowWarning,
    handleClick, 
    startPractice, 
    startBlocks, 
    cancel,
  }
}
