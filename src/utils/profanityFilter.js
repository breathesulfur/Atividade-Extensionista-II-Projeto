/**
 * Filtro de palavras ofensivas
 * Lista de palavras que devem ser bloqueadas para manter o ambiente seguro
 * Esta lista pode ser expandida conforme necessário
 */
const profanityWords = [
  // Palavras ofensivas comuns
  'idiota',
  'burro',
  'estupido',
  'retardado',
  'imbecil',
  'babaca',
  'otario',
  'trouxa',
  // Adicione mais palavras conforme necessário
  // Nota: Em produção, esta lista deveria ser mais abrangente
  // e possivelmente carregada de um servidor para atualizações dinâmicas
]

/**
 * Substitui palavras ofensivas por asteriscos
 * @param {string} text - Texto a ser filtrado
 * @returns {string} - Texto filtrado
 */
export const filterProfanity = (text) => {
  if (!text || typeof text !== 'string') return text

  let filteredText = text

  // Cria regex para cada palavra ofensiva (case insensitive)
  profanityWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    filteredText = filteredText.replace(regex, '*'.repeat(word.length))
  })

  return filteredText
}

/**
 * Verifica se o texto contém palavras ofensivas
 * @param {string} text - Texto a ser verificado
 * @returns {boolean} - true se contém palavras ofensivas
 */
export const containsProfanity = (text) => {
  if (!text || typeof text !== 'string') return false

  const lowerText = text.toLowerCase()
  return profanityWords.some(word => 
    lowerText.includes(word.toLowerCase())
  )
}
