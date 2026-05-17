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

## Variables d'environnement

### Obligatoires

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Clé API Anthropic (`sk-ant-...`) |
| `DATABASE_URL` | URL de connexion PostgreSQL |

### Optionnelles

| Variable | Défaut | Description |
|---|---|---|
| `BETTERSTACK_SOURCE_TOKEN` | _(vide)_ | Token Logtail — sans token, les logs vont dans la console |
| `BASIC_AUTH_ENABLED` | `false` | Active la protection HTTP Basic Auth (`true` / `false`) |
| `BASIC_AUTH_USER` | — | Identifiant de la protection Basic Auth |
| `BASIC_AUTH_PASS` | — | Mot de passe de la protection Basic Auth |

### Protection Basic Auth (staging / production)

Un middleware Nuxt intercepte toutes les requêtes et demande un identifiant/mot de passe via le dialogue natif du navigateur.

**Activation (Railway ou autre hébergeur) :**

```env
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=motdepasse
```

**Désactivation au lancement en production :**

```env
BASIC_AUTH_ENABLED=false
```

Règles de fonctionnement :
- Inactif si `BASIC_AUTH_ENABLED` est absent ou différent de `'true'` — ne jamais activer en local
- Si activé sans `BASIC_AUTH_USER` ou `BASIC_AUTH_PASS` définis, toutes les requêtes retournent une erreur `500` (pas de faille silencieuse)
- Les assets compilés (`/_nuxt/*`) sont exemptés

## Initialiser la base de données

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
│   └── analyses/
│       ├── index.get.ts      # GET  /api/analyses — liste paginée et triée
│       ├── index.post.ts     # POST /api/analyses — validation HTTP + délégation
│       └── [id].get.ts       # GET  /api/analyses/:id — détail d'une analyse
├── middleware/
│   └── basic-auth.ts         # Protection HTTP Basic Auth (optionnelle)
├── services/
│   ├── analyzeOrchestrator.ts  # Orchestration : cache DB + appel Claude
│   ├── analyzeService.ts       # Appel Claude (Anthropic SDK) + parsing
│   └── analysisRepository.ts   # Accès Prisma (save, findById, findPaginated)
└── utils/
    ├── logger.ts             # Logger Betterstack (fallback console en dev)
    ├── parseJson.ts          # Extraction JSON robuste depuis les réponses LLM
    └── rateLimiter.ts        # Rate limiting par IP (fenêtre glissante en mémoire)
```

La clé API Anthropic n'est jamais exposée côté client. Toute communication avec Claude transite par le serveur Nuxt.

## Sécurité API

### Rate limiting

Le endpoint `POST /api/analyses` (seul appel payant vers Claude) est protégé par un rate limiter par IP :

- **5 requêtes max** par fenêtre glissante de **60 secondes**
- Basé sur une Map en mémoire — adapté à un déploiement single-instance (Railway)
- Lit l'IP réelle via le header `X-Forwarded-For` (proxy Railway)
- Retourne un `429` avec le header `Retry-After` (en secondes) en cas de dépassement

> Le rate limiting journalier (quota fonctionnel par IP) est prévu dans une US dédiée et nécessitera une persistance (DB ou Redis).
