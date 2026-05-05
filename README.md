# Fact Checker v1

Application web de vérification de faits propulsée par Claude (Anthropic), construite avec Nuxt 3.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Nuxt 3 |
| UI | Tailwind CSS v4 |
| IA | Claude (Anthropic SDK) + web_search |
| Base de données | PostgreSQL + Prisma |
| i18n | @nuxtjs/i18n |
| Logs | Betterstack (Logtail) |
| Tests | Vitest + @nuxt/test-utils |

## Prérequis

- Node.js 20+
- npm
- PostgreSQL

## Installation

```bash
npm install
```

Copier le fichier d'environnement et remplir les valeurs :

```bash
cp .env.example .env
```

```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fact-checker-v1"
BETTERSTACK_SOURCE_TOKEN=        # optionnel en dev local
```

Initialiser la base de données :

```bash
npm run db:push
```

## Lancer le projet

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Tests

```bash
npm test                # one-shot
npm run test:watch      # mode watch
npm run test:coverage   # avec couverture
```

## Architecture serveur

```
server/
├── api/
│   └── analyze.post.ts       # Endpoint POST /api/analyze — validation HTTP
├── services/
│   └── analyzeService.ts     # Logique métier — appel Claude + parsing
└── utils/
    ├── logger.ts             # Logger Betterstack (fallback console en dev)
    └── parseJson.ts          # Extraction JSON robuste depuis les réponses LLM
```

La clé API Anthropic n'est jamais exposée côté client. Toute communication avec Claude transite par le serveur Nuxt.

## Environnements

Betterstack permet de différencier les sources de logs par environnement via `BETTERSTACK_SOURCE_TOKEN`. Sans token, les logs s'affichent uniquement dans la console (comportement dev par défaut).
