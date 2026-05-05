export function parseJson(text: string): unknown {
  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Aucun JSON trouvé dans la réponse')

  let s = text.slice(start, end + 1)

  try {
    return JSON.parse(s)
  } catch {
    // Trailing commas
    s = s.replace(/,(\s*[}\]])/g, '$1')

    // Unbalanced quotes
    const quoteCount = (s.match(/"/g) ?? []).length
    if (quoteCount % 2 !== 0) s += '"'

    // Unbalanced brackets
    const open  = (s.match(/[\[{]/g) ?? []).length
    const close = (s.match(/[\]}]/g) ?? []).length
    for (let i = 0; i < open - close; i++) {
      const last = [...s].reverse().find(c => c === '{' || c === '[')
      s += last === '{' ? '}' : ']'
    }

    return JSON.parse(s)
  }
}
