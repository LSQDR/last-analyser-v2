export function exportTaskJSON(taskKey, data) {
  const filename = `last-analyser_${taskKey}_${formatDate(data.completedAt)}.json`
  triggerDownload(filename, data)
}

export function exportAllJSON(data) {
  const payload = {
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    tasks: data,
  }
  triggerDownload(`last-analyser_all-tasks_${formatDate(new Date().toISOString())}.json`, payload)
}

function triggerDownload(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatDate(isoString) {
  if (!isoString) return 'unknown'
  return isoString.slice(0, 10)
}
