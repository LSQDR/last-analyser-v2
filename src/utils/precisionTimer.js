// rAF-based precision scheduler. Fires each event in the schedule when
// performance.now() - startTime >= event.scheduledAtMs.
// Returns a cancel function that stops the loop immediately.

export function runSchedule(schedule, onEventFire, onComplete) {
  if (!schedule || schedule.length === 0) {
    // Empty schedule, call onComplete on next tick so callers don't need to guard
    const tid = setTimeout(onComplete, 0)
    return () => clearTimeout(tid)
  }

  const startTime  = performance.now()
  let   nextIndex  = 0
  let   rafHandle  = null
  let   cancelled  = false

  function tick(now) {
    if (cancelled) return

    const elapsed = now - startTime

    // Fire all events whose scheduled time has been reached
    while (nextIndex < schedule.length && schedule[nextIndex].scheduledAtMs <= elapsed) {
      onEventFire(schedule[nextIndex], now)
      nextIndex++
    }

    if (nextIndex >= schedule.length) {
      // All events fired, wait a tick then call onComplete so the
      // last event's response window can register first
      setTimeout(onComplete, 0)
      return
    }

    rafHandle = requestAnimationFrame(tick)
  }

  rafHandle = requestAnimationFrame(tick)

  return function cancel() {
    cancelled  = true
    if (rafHandle != null) cancelAnimationFrame(rafHandle)
  }
}