import 'dart:typed_data';

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

class LearningElement {
  final String category;
  final String name;
  final String description;
  final String artisticUse;
  final String effect;
  final String howToUse;
  final String activity;

  const LearningElement({
    required this.category,
    required this.name,
    required this.description,
    required this.artisticUse,
    required this.effect,
    required this.howToUse,
    required this.activity,
  });

  factory LearningElement.fromJson(Map<String, dynamic> json) =>
      LearningElement(
        category: json['category'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        artisticUse: json['artisticUse'] as String,
        effect: json['effect'] as String,
        howToUse: json['howToUse'] as String,
        activity: json['activity'] as String,
      );
}

class LearningContent {
  final String summary;
  final List<LearningElement> elements;

  const LearningContent({required this.summary, required this.elements});

  factory LearningContent.fromJson(Map<String, dynamic> json) =>
      LearningContent(
        summary: json['summary'] as String,
        elements: (json['elements'] as List)
            .map(
              (item) => LearningElement.fromJson(item as Map<String, dynamic>),
            )
            .toList(),
      );
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

  /// Builds a [SceneAnalysis] from the real OpenCV output returned by
  /// `computer_vision/vision_service.py` (via `VisionClient`, port 8001).
  /// `concepts` still comes from the teammate-owned Gemini/CV pipeline this
  /// doesn't touch, so the caller carries the previous scene's concepts
  /// forward.
  factory SceneAnalysis.fromCvJson(
    Map<String, dynamic> json, {
    required List<ArtConcept> concepts,
  }) {
    // The real dominant colors OpenCV picked up from this exact photo.
    // Shapes/lines/textures/patterns/objects don't carry their own color
    // in the CV output, so they're tinted from this real palette (cycled)
    // instead of a fixed placeholder — every swatch reflects the actual
    // scene, not a constant.
    final detectedColors = [
      for (final item
          in ((json['colors'] as List?) ?? const []).cast<Map<String, dynamic>>())
        if (item['hex'] != null) _colorFromHex(item['hex'] as String),
    ];

    // Only reached if OpenCV found literally zero colors in the photo.
    const neutralFallback = Color(0xFF9AA0A6);

    List<Supply> supplies(String key, SwatchKind kind, IconGlyph glyph) {
      final items = (json[key] as List?) ?? const [];
      var accentIndex = 0;
      return [
        for (final item in items.cast<Map<String, dynamic>>())
          Supply(
            label: (item['label'] ?? item['hex'] ?? '').toString(),
            kind: kind,
            color: item['hex'] != null
                ? _colorFromHex(item['hex'] as String)
                : (detectedColors.isEmpty
                      ? neutralFallback
                      : detectedColors[accentIndex++ % detectedColors.length]),
            glyph: glyph,
          ),
      ];
    }

    return SceneAnalysis(
      colors: supplies('colors', SwatchKind.color, IconGlyph.circle),
      shapes: supplies('shapes', SwatchKind.shape, IconGlyph.circle),
      lines: supplies('lines', SwatchKind.line, IconGlyph.lines),
      textures: supplies('textures', SwatchKind.texture, IconGlyph.wave),
      patterns: supplies('patterns', SwatchKind.pattern, IconGlyph.stripes),
      objects: supplies('semanticObjects', SwatchKind.object, IconGlyph.camera),
      concepts: concepts,
    );
  }
}

Color _colorFromHex(String hex) {
  final cleaned = hex.replaceFirst('#', '');
  return Color(int.parse('FF$cleaned', radix: 16));
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
/// `assetUrl`/`thumbnailUrl` for entries with no uploaded photo (e.g. synced
/// from the backend, or seed data).
class LibraryEntry {
  final String id;
  final String challengeTitle;
  final String origin; // 'Create' or 'Learn' — mirrors session `mode`
  final String? conceptTitle;
  final Color photoTint;
  final IconGlyph photoGlyph;
  final DateTime date;

  /// The user's actual uploaded photo of their finished artwork, if any —
  /// takes priority over [photoTint]/[photoGlyph] when rendering this entry.
  final Uint8List? photoBytes;

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
    this.photoBytes,
    this.remoteId,
  });
}
