// Middleware d'auth dédié exclusivement au dev avant mise en service de l'app
// Ne sera plus nécessaire à terme
export default defineEventHandler((event) => {
  // Désactivé si la variable n'est pas explicitement à 'true'
  if (process.env.BASIC_AUTH_ENABLED !== 'true') return

  // Les assets compilés Nuxt n'ont pas besoin d'être protégés
  const url = getRequestURL(event)
  if (url.pathname.startsWith('/_nuxt/')) return

  // Sécurité : si l'auth est activée mais les credentials manquent, on bloque tout
  if (!process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASS) {
    throw createError({
      statusCode: 500,
      statusMessage: 'BASIC_AUTH_ENABLED est activé mais BASIC_AUTH_USER ou BASIC_AUTH_PASS est manquant.',
    })
  }

  const header   = getHeader(event, 'authorization')
  const expected = `Basic ${Buffer.from(
    `${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`
  ).toString('base64')}`

  if (header !== expected) {
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="Restricted"')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
