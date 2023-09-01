export default function useElectron() {
  const isRenderer = !process.server && window.process && window.process.type === 'renderer'
  const isBrowser = process.type === 'browser'

  const isElectron = isRenderer || isBrowser

  return {
    isElectron
  }
}
