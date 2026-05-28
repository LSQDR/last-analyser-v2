
export function normaliseDomainScores(data) {
  return [
    { taskId: 'tapThePulse', domain: 'Sustained Attention', score: normaliseTask1(data?.tapThePulse), fullMark: 100 },
    { taskId: 'signalStop', domain: 'Inhibition Control', score: normaliseTask2(data?.signalStop), fullMark: 100 },
    { taskId: 'wordColourClash', domain: 'Interference Control', score: normaliseTask3(data?.wordColourClash), fullMark: 100 },
    { taskId: 'matchOrPass', domain: 'Working Memory', score: normaliseTask4(data?.matchOrPass), fullMark: 100 },
  ]
}

function normaliseTask1(task1) {
  if (!task1) return null
  const omissionScore = Math.max(0, 100 - task1.overall.omissionRatepct * 2)
  const cvScore = Math.max(0, 100 - task1.overall.cvpct * 1.5)
  const decayScore = task1.overall.attentionDecaySlope > 0
    ? Math.max(0, 100 - task1.overall.attentionDecaySlope * 200)
    : 100
  return Math.round((omissionScore + cvScore + decayScore) / 3)
}

function normaliseTask2(task2) {
  if (!task2) return null
  if (!task2.overall.SSRTisValid) return 50
  const ssrtScore = Math.max(0, Math.min(100, ((500 - task2.overall.SSRTms) / (500 - 100)) * 100))
  const accuracyScore = task2.overall.stopAccuracypct
  return Math.round((ssrtScore + accuracyScore) / 2)
}

function normaliseTask3(task3) {
  if (!task3) return null
  const interferenceScore = Math.max(0, Math.min(100, ((250 - task3.overall.trueInterferencems) / 250) * 100))
  const accuracyScore = task3.overall.incongruentAccuracypct
  return Math.round((interferenceScore + accuracyScore) / 2)
}

function normaliseTask4(task4) {
  if (!task4) return null
  return Math.max(0, Math.min(100, task4.overall.correctedHitRatepct))
}