const sizePrefixes = ['', 'k', 'M', 'G', 'T', 'P']

export function sizeFormatter(bytes) {
  let prefixIndex = 0
  let size = bytes

  while (prefixIndex < sizePrefixes.length && size > 1024) {
    prefixIndex++
    size /= 1024
  }

  return `${Math.floor(size)} ${sizePrefixes[prefixIndex]}B`
}

export function secondsFormatter(seconds) {
  seconds = Math.floor(seconds)

  let hours = Math.floor(seconds / 3600)
  let mins = Math.floor((seconds - 3600 * hours) / 60)
  let secs = seconds % 60

  if (secs < 10) {
    secs = `0${secs}`
  }

  if (seconds < 3600) {
    return `${mins}:${secs}`
  } else {
    if (mins < 10) {
      mins = `0${mins}`
    }
    return `${hours}:${mins}:${secs}`
  }
}

export function millisecondsFormatter(milliseconds) {
  return secondsFormatter(Math.floor(milliseconds / 1000))
}
