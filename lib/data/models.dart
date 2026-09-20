import 'package:flutter/material.dart';

/// Which hand-drawn line icon represents a swatch, concept, or mock photo.
enum IconGlyph {
  circle,
  plant,
  lines,
  wave,
  stripes,
  spark,
  symmetry,
  palette,
  camera,
  perspective,
  compass,
  cloud,
}

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

  List<Supply> get allSwatches => [
    ...colors,
    ...shapes,
    ...lines,
    ...textures,
    ...patterns,
    ...objects,
  ];
}

/// Converts this mocked scene into the JSON shape the backend's
/// `sceneAnalysisSchema` (`src/api/validation/schemas.ts`) expects, so it can
/// be posted to `/api/sessions/:sessionId/scene-analysis` or
/// `/api/challenges/recommend` until a real CV pipeline replaces the mock.
extension SceneAnalysisApi on SceneAnalysis {
  Map<String, dynamic> toApiJson() {
    List<Map<String, dynamic>> features(
      List<Supply> supplies,
      String prefix, {
      String? orientation,
    }) => [
      for (var i = 0; i < supplies.length; i++)
        {
          'id': '$prefix-$i',
          'label': supplies[i].label,
          if (prefix == 'color') 'name': supplies[i].label,
          if (prefix == 'color') 'hex': _hex(supplies[i].color),
          if (orientation != null) 'orientation': orientation,
        },
    ];

    return {
      'colors': features(colors, 'color'),
      'shapes': features(shapes, 'shape'),
      'textures': features(textures, 'texture'),
      'lines': features(lines, 'line', orientation: 'vertical'),
      'patterns': features(patterns, 'pattern'),
      'semanticObjects': features(objects, 'object'),
    };
  }

  String _hex(Color c) =>
      '#${(c.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
}

/// Artist-facing challenge returned by the backend, or authored Learn copy.
/// Standalone Create reads the exact title/instructions from its saved instance.
class CreativeChallenge {
  final String? instanceId;
  final String title;
  final String instructions;
  final int difficulty;
  final String challengeType;
  final String? inspiredByConcept;
  final String? templateId;
  final List<String>? reasonCodes;

  const CreativeChallenge({
    this.instanceId,
    required this.title,
    required this.instructions,
    required this.difficulty,
    required this.challengeType,
    this.inspiredByConcept,
    this.templateId,
    this.reasonCodes,
  });

  factory CreativeChallenge.fromInstance(Map<String, dynamic> json) {
    return CreativeChallenge(
      instanceId: json['id'] as String,
      title: json['title'] as String,
      instructions: json['instructions'] as String,
      difficulty: (json['difficulty'] as num).toInt(),
      challengeType: json['challengeType'] as String,
      templateId: json['templateId'] as String,
      reasonCodes: (json['reasonCodes'] as List?)?.cast<String>(),
    );
  }

  /// Folds in a backend `ChallengeDecision` (`src/core/types/visual.ts`),
  /// keeping this wireframe's authored title/instructions since the backend
  /// has no Gemini-generated copy yet. Returns `this` unchanged if [decision]
  /// is null (backend unavailable, or the scene had insufficient features).
  CreativeChallenge mergeDecision(Map<String, dynamic>? decision) {
    if (decision == null) return this;
    return CreativeChallenge(
      title: title,
      instructions: instructions,
      difficulty: (decision['difficulty'] as num?)?.toInt() ?? difficulty,
      challengeType: decision['challengeType'] as String? ?? challengeType,
      inspiredByConcept: inspiredByConcept,
      templateId: decision['challengeTemplateId'] as String?,
      reasonCodes: (decision['reasonCodes'] as List?)?.cast<String>(),
    );
  }
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

  /// Backend `Artwork.id` (`src/database/repository.ts`) when this entry was
  /// synced from `GET /api/users/:userId/artworks`; null for local-only or
  /// seed entries. Used to dedupe repeated syncs.
  final String? remoteId;

  const LibraryEntry({
    required this.id,
    required this.challengeTitle,
    required this.origin,
    this.conceptTitle,
    required this.photoTint,
    required this.photoGlyph,
    required this.date,
    this.remoteId,
  });
}
