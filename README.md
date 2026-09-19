# The Prevengers Backend

This repository now contains a clean Node.js + TypeScript backend that implements the Person 4 product engine and persistence layer for the AI creative companion.

## What this subsystem does

- Evaluates a `SceneAnalysis` against a deterministic set of challenge templates.
- Recommends a challenge type based on scene ingredients and user history.
- Tracks user progression and learning concepts.
- Stores creative session metadata and artwork references.
- Provides learning-resource retrieval with a graceful fallback when Firecrawl is not configured.
- Exposes REST endpoints for Flutter and future integration work.

## Architecture

- `src/product` — challenge engine and recommendation logic
- `src/services` — session, artwork, and learning-resource services
- `src/database` — MongoDB connection and schema definitions
- `src/api/validation` — request validation
- `src/data` — mock scenes and seed content
- `src/core` — shared contracts and API errors

## Installation

1. Install dependencies:
   npm install
2. Copy `.env.example` to `.env` and update values as needed.
3. Start the backend in development mode:
   npm run dev

## Environment variables

See `.env.example`.

- `PORT` — backend port
- `MONGODB_URI` — MongoDB connection string
- `FIRECRAWL_API_KEY` — optional Firecrawl key
- `NODE_ENV` — environment mode
- `CORS_ORIGIN` — allowed frontend origin

## Development commands

- `npm run dev` — watch mode
- `npm run build` — TypeScript build
- `npm run seed` — seed challenge templates, a demo user, and learning resources into MongoDB (skips gracefully if MongoDB is unreachable)
- `npm test` — Vitest suite (unit + HTTP integration tests)
- `npm run lint` — ESLint check

## MongoDB setup

The app attempts to connect to MongoDB using `MONGODB_URI` when configured. All persistence (sessions, challenge completions, artworks, learning-resource cache, users) is backed by Mongoose models in `src/database/models.ts` and written through the repository layer in `src/database/repository.ts`. If MongoDB is unavailable, the repository layer transparently falls back to an in-memory store per process so the backend keeps working locally without crashing — this fallback is not persisted across restarts, unlike real MongoDB-backed data.

## Seeding

Run `npm run seed` to upsert the challenge template library, a demo user, and cached learning resources directly into MongoDB. The script is idempotent (safe to re-run) and exits cleanly if MongoDB is not reachable.

## API routes

### Health
- `GET /api/health`

### Sessions
- `POST /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions/:sessionId/scene-analysis`
- `POST /api/sessions/:sessionId/complete`

### Challenges
- `POST /api/challenges/recommend`

### User progress and artwork
- `GET /api/users/:userId/progress` — returns challenge history plus concept-level Learning Progress:
  ```json
  {
    "completedChallengeCount": 1,
    "challengeTypeDistribution": { "architecture": 1 },
    "recentChallenges": [ { "challengeType": "architecture", "concepts": ["perspective", "line", "shape", "composition"] } ],
    "conceptExposure": { "perspective": 0, "line": 0, "shape": 1, "composition": 1 },
    "underusedConcepts": ["perspective", "line", "color", "texture"],
    "learning": {
      "concepts": [
        { "concept": "shape", "timesSeen": 1, "timesPracticed": 1, "lastSeenAt": "...", "lastPracticedAt": "..." },
        { "concept": "perspective", "timesSeen": 1, "timesPracticed": 0, "lastSeenAt": "...", "lastPracticedAt": null }
      ],
      "underusedConcepts": ["perspective", "line", "color", "texture"]
    }
  }
  ```
- `POST /api/artworks`
- `GET /api/users/:userId/artworks`

### Learning resources
- `GET /api/learning/resources?concept=symmetry`

### Mock data
- `GET /api/mock-scenes/:sceneName`

## Sample SceneAnalysis

```json
{
  "colors": [
    { "id": "color-1", "name": "forest green", "hex": "#527A49" }
  ],
  "shapes": [
    { "id": "shape-1", "label": "circle" }
  ],
  "textures": [
    { "id": "texture-1", "label": "concrete" }
  ],
  "lines": [
    { "id": "line-1", "orientation": "vertical" }
  ],
  "patterns": [],
  "semanticObjects": [
    { "id": "object-1", "label": "plant pot" }
  ]
}
```

## Challenge decision output

```json
{
  "challengeTemplateId": "tpl-character",
  "challengeType": "character",
  "difficulty": 3,
  "matchedIngredients": [
    { "type": "shape", "featureId": "shape-1" },
    { "type": "color", "featureId": "color-1" },
    { "type": "texture", "featureId": "texture-1" }
  ],
  "requiredIngredientTypes": ["shape", "color", "texture"],
  "reasonCodes": ["eligible_for_character", "scene_matches_shape_color_texture"],
  "personalizationContext": {
    "underusedConcepts": ["perspective", "repetition"],
    "recentlyUsedChallengeTypes": ["character"]
  }
}
```

## Firecrawl fallback behavior

- If `FIRECRAWL_API_KEY` is not set, the system falls back to the local mock resource provider so the backend still works.
- Firecrawl is isolated behind a provider interface and can be replaced later without affecting route handling.

## Flutter integration

Flutter should call the JSON REST API using predictable, typed responses. A typical flow is:

1. Create a session via `POST /api/sessions`
2. Send a `SceneAnalysis` to `POST /api/sessions/:sessionId/scene-analysis`
3. Consume the returned challenge decision
4. Complete challenge via `POST /api/sessions/:sessionId/complete`

## Gemini handoff

The backend emits a Gemini-friendly context object from the challenge decision and selected scene features; this is assembled in `buildGeminiContext` inside `src/product/engine.ts`.

## OpenCV contract

OpenCV must send a structured `SceneAnalysis` matching the contract in `src/core/types/visual.ts`.
