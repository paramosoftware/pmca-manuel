export default function useIsElectron() {
  let isElectron = false

  const isRenderer = !process.server && window.process && window.process.type === 'renderer'
  const isBrowser = !process.client && process.type === 'browser'

  isElectron = isRenderer || isBrowser
  
  return isElectron
}
