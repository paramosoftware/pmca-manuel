export default function useElectron() {
  const isElectron = !process.server && window.process && window.process.type
  return {
    isElectron
  }
}
