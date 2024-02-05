export default function isElectron() {
  const isRenderer = !process.server && window.process && window.process.type === 'renderer'
  const isBrowser = !process.client && process.type === 'browser'

  return  isRenderer || isBrowser
}