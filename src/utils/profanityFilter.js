// Lista de palavras ofensivas em PT-BR (sem acentos).
// O motor normaliza o texto e constrói regex com variações acentuadas.

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

const RACISM = [
  'macaco', 'macaca',
  'crioulo', 'crioula',
  'mulato', 'mulata',
]

const ALL_WORDS = [...GENERAL, ...MISOGYNY, ...LGBTPHOBIA, ...RACISM]

const ACCENT_VARIANTS = {
  a: '[aáàâãä]',
  e: '[eéèêë]',
  i: '[iíìîï]',
  o: '[oóòôõö]',
  u: '[uúùûü]',
  c: '[cç]',
  n: '[nñ]',
}

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

export const filterProfanity = (text) => {
  if (!text || typeof text !== 'string') return text
  let result = text
  for (const word of ALL_WORDS) {
    result = result.replace(buildRegex(word), (match) => '*'.repeat(match.length))
  }
  return result
}

export const containsProfanity = (text) => {
  if (!text || typeof text !== 'string') return false
  return ALL_WORDS.some(word => {
    const re = buildRegex(word)
    re.lastIndex = 0
    return re.test(text)
  })
}
