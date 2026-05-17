/**
 * Filtro de palavras ofensivas.
 *
 * Lista mantida em PT-BR sem acentos. O motor normaliza o texto antes de
 * comparar (remove diacríticos) e constrói regex que aceita variações
 * acentuadas e plural, garantindo casamento mesmo com "vádia", "VADIAS", etc.
 *
 * A lista é dividida por categoria apenas para fins de manutenção — todas as
 * categorias são tratadas igualmente em runtime.
 */

// Palavrões e ofensas gerais
const GENERAL = [
  'caralho', 'kralho', 'krl',
  'porra', 'prr',
  'merda', 'mrda',
  'bosta',
  'foda', 'fodase', 'foder', 'fude', 'fudido', 'fudida',
  'desgraca', 'desgracado', 'desgracada',
  'escroto', 'escrota',
  'otario', 'otaria',
  'imbecil',
  'burro', 'burra',
  'idiota',
  'retardado', 'retardada',
  'demente',
  'estupido', 'estupida',
  'babaca',
  'trouxa',
  'pqp', 'fdp', 'vsf', 'vtnc', 'vtmc',
]

// Termos pejorativos / misóginos contra mulheres
const MISOGYNY = [
  'puta', 'putinha', 'putona',
  'vadia', 'vagaba', 'vagabunda',
  'piranha', 'piriguete',
  'biscate',
  'rapariga',
  'prostituta',
  'safada', 'safadona',
  'mulherzinha',
  'galinha',
]

// Termos LGBTfóbicos (insultos contra a comunidade LGBTQIAPN+)
const LGBTPHOBIA = [
  'viado', 'veado', 'biba', 'bichinha',
  'bicha',
  'traveco',
  'sapatao', 'sapatona',
  'maricas',
  'frutinha',
  'baitola',
  'sodomita',
  'aberracao',
  'aberracoes',
]

// Termos racistas
const RACISM = [
  'macaco', 'macaca',
  'crioulo', 'crioula',
  'mulato', 'mulata',
]

const ALL_WORDS = [...GENERAL, ...MISOGYNY, ...LGBTPHOBIA, ...RACISM]

// Mapa de cada letra ASCII para o conjunto de variantes acentuadas em PT-BR.
const ACCENT_VARIANTS = {
  a: '[aáàâãä]',
  e: '[eéèêë]',
  i: '[iíìîï]',
  o: '[oóòôõö]',
  u: '[uúùûü]',
  c: '[cç]',
  n: '[nñ]',
}

// Constroi um regex case-insensitive que aceita variações acentuadas e plural
// opcional para uma palavra-raiz. Cacheado para evitar reconstruir a cada chamada.
const regexCache = new Map()
function buildRegex(word) {
  if (regexCache.has(word)) return regexCache.get(word)
  const pattern = word
    .toLowerCase()
    .split('')
    .map(c => ACCENT_VARIANTS[c] || c)
    .join('')
  const re = new RegExp(`\\b${pattern}s?\\b`, 'gi')
  regexCache.set(word, re)
  return re
}

/**
 * Substitui palavras ofensivas por asteriscos, preservando o tamanho original.
 */
export const filterProfanity = (text) => {
  if (!text || typeof text !== 'string') return text
  let result = text
  for (const word of ALL_WORDS) {
    result = result.replace(buildRegex(word), (match) => '*'.repeat(match.length))
  }
  return result
}

/**
 * Verifica se o texto contém alguma palavra ofensiva.
 */
export const containsProfanity = (text) => {
  if (!text || typeof text !== 'string') return false
  return ALL_WORDS.some(word => {
    const re = buildRegex(word)
    re.lastIndex = 0
    return re.test(text)
  })
}
