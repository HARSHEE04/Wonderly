import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'models.dart';

/// Stand-in for the teammate-owned CV/Gemini scene-analysis pipeline.
/// Shape and sample values mirror `mockScenes.characterFriendly` in the
/// backend's `src/data/mockScenes.ts` (forest green / circle / concrete /
/// vertical line / plant pot), extended with a `patterns` example and the
/// concept tags a matching `ChallengeTemplate` would carry.
final SceneAnalysis mockSceneAnalysis = SceneAnalysis(
  colors: const [
    Supply(
      label: 'Forest Green',
      kind: SwatchKind.color,
      color: AppColors.forestGreen,
      glyph: IconGlyph.circle,
    ),
    Supply(
      label: 'Warm Yellow',
      kind: SwatchKind.color,
      color: AppColors.yellow,
      glyph: IconGlyph.circle,
    ),
    Supply(
      label: 'Dusty Pink',
      kind: SwatchKind.color,
      color: AppColors.pink,
      glyph: IconGlyph.circle,
    ),
  ],
  shapes: const [
    Supply(
      label: 'Circle',
      kind: SwatchKind.shape,
      color: AppColors.coral,
      glyph: IconGlyph.circle,
    ),
    Supply(
      label: 'Rectangle',
      kind: SwatchKind.shape,
      color: AppColors.violet,
      glyph: IconGlyph.stripes,
    ),
  ],
  lines: const [
    Supply(
      label: 'Vertical Lines',
      kind: SwatchKind.line,
      color: AppColors.sky,
      glyph: IconGlyph.lines,
    ),
  ],
  textures: const [
    Supply(
      label: 'Concrete',
      kind: SwatchKind.texture,
      color: Color(0xFFB9B3A6),
      glyph: IconGlyph.wave,
    ),
    Supply(
      label: 'Leaves',
      kind: SwatchKind.texture,
      color: AppColors.forestGreen,
      glyph: IconGlyph.plant,
    ),
  ],
  patterns: const [
    Supply(
      label: 'Repetition',
      kind: SwatchKind.pattern,
      color: AppColors.pinkDeep,
      glyph: IconGlyph.stripes,
    ),
  ],
  objects: const [
    Supply(
      label: 'Plant Pot',
      kind: SwatchKind.object,
      color: AppColors.forestGreen,
      glyph: IconGlyph.plant,
    ),
  ],
  concepts: const [
    ArtConcept(
      id: 'symmetry',
      title: 'Symmetry',
      blurb: 'Both sides of that building mirror each other.',
      glyph: IconGlyph.symmetry,
      accent: AppColors.sky,
    ),
    ArtConcept(
      id: 'composition',
      title: 'Composition',
      blurb: 'The doorway sits right where these lines cross.',
      glyph: IconGlyph.lines,
      accent: AppColors.violet,
    ),
    ArtConcept(
      id: 'perspective',
      title: 'Perspective',
      blurb: 'Those vertical lines all lead toward one point.',
      glyph: IconGlyph.perspective,
      accent: AppColors.pinkDeep,
    ),
  ],
);

/// The scene actually shown across Learn/Create screens: starts as the mock
/// above, and gets replaced with real OpenCV output (see
/// `SceneAnalysis.fromCvJson`) once a scan screen successfully analyzes a
/// captured photo.
SceneAnalysis currentSceneAnalysis = mockSceneAnalysis;

List<LibraryEntry> buildSeedLibrary() => [
  LibraryEntry(
    id: 'seed-1',
    challengeTitle: 'Find a Symmetrical Object',
    origin: 'Learn',
    conceptTitle: 'Symmetry',
    photoTint: AppColors.tealTint,
    photoGlyph: IconGlyph.symmetry,
    date: DateTime.now().subtract(const Duration(days: 2)),
  ),
  LibraryEntry(
    id: 'seed-2',
    challengeTitle: 'Sketch a Stranger\'s Shoes',
    origin: 'Create',
    photoTint: AppColors.marigoldTint,
    photoGlyph: IconGlyph.spark,
    date: DateTime.now().subtract(const Duration(days: 5)),
  ),
  LibraryEntry(
    id: 'seed-3',
    challengeTitle: 'Chase the Vanishing Point',
    origin: 'Learn',
    conceptTitle: 'Perspective',
    photoTint: AppColors.brickTint,
    photoGlyph: IconGlyph.perspective,
    date: DateTime.now().subtract(const Duration(days: 8)),
  ),
];
