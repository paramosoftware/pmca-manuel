export const useNormalizeString = () => {
  const normalizeString = (str: String) => {
    const normalizedStr = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return normalizedStr.toLowerCase().replace(/\s/g, '-')
  }

  return { normalizeString }
}