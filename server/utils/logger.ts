import { Logtail } from '@logtail/node'

type LogContext = Record<string, unknown>

// Logtail est instancié une seule fois au démarrage du serveur.
// Sans token (dev local), les logs vont uniquement dans la console.
const logtail = process.env.BETTERSTACK_SOURCE_TOKEN
  ? new Logtail(process.env.BETTERSTACK_SOURCE_TOKEN)
  : null

export const logger = {
  error(message: string, context?: LogContext): void {
    console.error('[ERROR]', message, context ?? '')
    logtail?.error(message, context)
  },
  warn(message: string, context?: LogContext): void {
    console.warn('[WARN]', message, context ?? '')
    logtail?.warn(message, context)
  },
  info(message: string, context?: LogContext): void {
    console.info('[INFO]', message, context ?? '')
    logtail?.info(message, context)
  },
}
