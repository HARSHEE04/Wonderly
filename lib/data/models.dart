import 'package:flutter/material.dart';

/// Which hand-drawn line icon represents a swatch, concept, or mock photo.
enum IconGlyph { circle, plant, lines, wave, stripes, spark, symmetry, palette, camera, perspective }

/// Mirrors the backend's `IngredientType` union (`src/core/types/visual.ts`),
/// minus `semanticObject` which is spelled out as [SwatchKind.object] here.
enum SwatchKind { color, shape, line, texture, pattern, object }

/// A single element the (mocked) scene analysis returned — mirrors one of
/// the backend's `*Feature` shapes (`ColorFeature`, `ShapeFeature`, etc. in
/// `src/core/types/visual.ts`), rendered as a hand-drawn swatch tile rather
/// than raw CV output.
class Supply {
  final String label;
  final SwatchKind kind;
  final Color color;
  final IconGlyph glyph;

  const Supply({
    required this.label,
    required this.kind,
    required this.color,
    required this.glyph,
  });
}

/// A concept tag surfaced alongside a challenge — mirrors the plain string
/// tags in `ChallengeTemplate.concepts` on the backend (e.g. "symmetry").
/// `blurb` is a short, scene-specific note (the kind of thing Gemini would
/// eventually generate); the actual teaching content is a [LearningResource].
class ArtConcept {
  final String id;
  final String title;
  final String blurb;
  final IconGlyph glyph;
  final Color accent;

  const ArtConcept({
    required this.id,
    required this.title,
    required this.blurb,
    required this.glyph,
    required this.accent,
  });
}

/// Mirrors the backend's `LearningResource` (`src/core/types/visual.ts`) —
/// what `GET /api/learning/resources?concept=` actually returns: an external
/// resource (Firecrawl-fetched, or the demo fallback), not authored copy.
class LearningResource {
  final String concept;
  final String title;
  final String url;
  final String source;
  final String summary;

  const LearningResource({
    required this.concept,
    required this.title,
    required this.url,
    required this.source,
    required this.summary,
  });
}

/// Placeholder for the teammate-owned CV/Gemini output. Frontend only reads
/// this shape; the real data will come from another teammate's pipeline.
/// Field names match `SceneAnalysis` in `src/core/types/visual.ts` exactly
/// (`objects` here stands in for the backend's `semanticObjects`).
class SceneAnalysis {
  final List<Supply> colors;
  final List<Supply> shapes;
  final List<Supply> lines;
  final List<Supply> textures;
  final List<Supply> patterns;
  final List<Supply> objects;
  final List<ArtConcept> concepts;

  const SceneAnalysis({
    required this.colors,
    required this.shapes,
    required this.lines,
    required this.textures,
    required this.patterns,
    required this.objects,
    required this.concepts,
  });

  List<Supply> get allSwatches => [...colors, ...shapes, ...lines, ...textures, ...patterns, ...objects];
}

/// Placeholder for the teammate-owned challenge-generation logic.
/// `challengeType` mirrors the backend's fixed `ChallengeType` union
/// (character | poster | architecture | abstract | pattern | composition)
/// and `difficulty` mirrors its numeric scale — the backend has no
/// `title`/`instructions` yet (that's the future Gemini handoff), so those
/// two fields are this wireframe's stand-in for that output.
class CreativeChallenge {
  final String title;
  final String instructions;
  final int difficulty;
  final String challengeType;
  final String? inspiredByConcept;

  const CreativeChallenge({
    required this.title,
    required this.instructions,
    required this.difficulty,
    required this.challengeType,
    this.inspiredByConcept,
  });
}

/// One saved piece in the user's Library — a photographed physical artwork.
/// Loosely mirrors the backend's `Artwork` model (`src/database/models.ts`):
/// `challengeTitle`~title, `photoTint`/`photoGlyph` stand in for
/// `assetUrl`/`thumbnailUrl` until there's a real photo to store.
class LibraryEntry {
  final String id;
  final String challengeTitle;
  final String origin; // 'Create' or 'Learn' — mirrors session `mode`
  final String? conceptTitle;
  final Color photoTint;
  final IconGlyph photoGlyph;
  final DateTime date;

  const LibraryEntry({
    required this.id,
    required this.challengeTitle,
    required this.origin,
    this.conceptTitle,
    required this.photoTint,
    required this.photoGlyph,
    required this.date,
  });
}
