
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_tile.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../services/api_client.dart';
import 'learn_concept_screen.dart';

class LearnFoundScreen extends StatelessWidget {
  final LearnSessionResult? sessionResult;

  /// The REAL SceneAnalysis JSON returned by the Python Vision service.
  final Map<String, dynamic>? sceneJson;

  const LearnFoundScreen({
    super.key,
    this.sessionResult,
    this.sceneJson,
  });

  /// Convert a hexadecimal color such as "#C8C0B9" into a Flutter Color.
  Color _colorFromHex(String? hex) {
    if (hex == null || hex.isEmpty) {
      return AppColors.sky;
    }

    try {
      final cleaned = hex.replaceFirst('#', '');
      final value = int.parse(cleaned, radix: 16);

      if (cleaned.length == 6) {
        return Color(0xFF000000 | value);
      }

      if (cleaned.length == 8) {
        return Color(value);
      }
    } catch (_) {
      // Use the fallback color if the backend returns an invalid hex code.
    }

    return AppColors.sky;
  }

  /// Convert one category of OpenCV features into the Supply objects
  /// used by the existing AtelierTile widget.
  List<Supply> _readSupplies(
    Map<String, dynamic> json,
    String key,
    SwatchKind kind,
    IconGlyph glyph,
    Color fallbackColor,
  ) {
    final rawFeatures = json[key];

    if (rawFeatures is! List) {
      return [];
    }

    return rawFeatures.map<Supply>((raw) {
      if (raw is! Map) {
        return Supply(
          label: key,
          kind: kind,
          color: fallbackColor,
          glyph: glyph,
        );
      }

      final feature = Map<String, dynamic>.from(raw);

      final label = (feature['label'] ??
              feature['name'] ??
              feature['orientation'] ??
              key)
          .toString();

      final color = kind == SwatchKind.color
          ? _colorFromHex(feature['hex']?.toString())
          : fallbackColor;

      return Supply(
        label: label,
        kind: kind,
        color: color,
        glyph: glyph,
      );
    }).toList();
  }

  /// Create learning-topic links based on which feature categories
  /// were actually detected. These are suggested topics, not additional
  /// claims made by the OpenCV detector.
  List<ArtConcept> _topicsForScene({
    required List<Supply> colors,
    required List<Supply> shapes,
    required List<Supply> lines,
    required List<Supply> textures,
    required List<Supply> patterns,
  }) {
    return [
      if (colors.isNotEmpty)
        ArtConcept(
          id: 'color',
          title: 'color',
          blurb: 'Explore the colors found in your photograph.',
          glyph: IconGlyph.circle,
          accent: AppColors.sky,
        ),
      if (shapes.isNotEmpty)
        ArtConcept(
          id: 'shape',
          title: 'shape',
          blurb: 'Explore how shapes can be used in artwork.',
          glyph: IconGlyph.circle,
          accent: AppColors.forestGreen,
        ),
      if (lines.isNotEmpty)
        ArtConcept(
          id: 'composition',
          title: 'composition',
          blurb: 'Explore how lines can guide the viewer’s eye.',
          glyph: IconGlyph.lines,
          accent: AppColors.sky,
        ),
      if (textures.isNotEmpty)
        ArtConcept(
          id: 'contrast',
          title: 'contrast',
          blurb: 'Explore differences in visual detail and texture.',
          glyph: IconGlyph.plant,
          accent: AppColors.forestGreen,
        ),
      if (patterns.isNotEmpty)
        ArtConcept(
          id: 'repetition',
          title: 'repetition',
          blurb: 'Explore how repeating elements create patterns.',
          glyph: IconGlyph.lines,
          accent: AppColors.sky,
        ),
    ];
  }

  /// Build the existing Flutter UI model from REAL Python SceneAnalysis.
  SceneAnalysis _sceneFromJson(Map<String, dynamic> json) {
    final colors = _readSupplies(
      json,
      'colors',
      SwatchKind.color,
      IconGlyph.circle,
      AppColors.sky,
    );

    final shapes = _readSupplies(
      json,
      'shapes',
      SwatchKind.shape,
      IconGlyph.circle,
      AppColors.forestGreen,
    );

    final lines = _readSupplies(
      json,
      'lines',
      SwatchKind.line,
      IconGlyph.lines,
      AppColors.sky,
    );

    final textures = _readSupplies(
      json,
      'textures',
      SwatchKind.texture,
      IconGlyph.plant,
      AppColors.forestGreen,
    );

    final patterns = _readSupplies(
      json,
      'patterns',
      SwatchKind.pattern,
      IconGlyph.lines,
      AppColors.sky,
    );

    final objects = _readSupplies(
      json,
      'semanticObjects',
      SwatchKind.object,
      IconGlyph.plant,
      AppColors.forestGreen,
    );

    final concepts = _topicsForScene(
      colors: colors,
      shapes: shapes,
      lines: lines,
      textures: textures,
      patterns: patterns,
    );

    return SceneAnalysis(
      colors: colors,
      shapes: shapes,
      lines: lines,
      textures: textures,
      patterns: patterns,
      objects: objects,
      concepts: concepts,
    );
  }

  @override
  Widget build(BuildContext context) {
    // No mock fallback: show only the data supplied by the Vision service.
    final scene = _sceneFromJson(sceneJson ?? const <String, dynamic>{});

    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                  child: Row(
                    children: [
                      CircleIconButton(
                        icon: Icons.arrow_back_ios_new_rounded,
                        onTap: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text.rich(
                          TextSpan(
                            style: sketchDisplay(fontSize: 34),
                            children: const [
                              TextSpan(text: 'what we '),
                              TextSpan(
                                text: 'found',
                                style: TextStyle(
                                  backgroundColor: Color(0x66FFCB3D),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${scene.allSwatches.length} elements, '
                          '${scene.concepts.length} topics worth exploring',
                          style: sketchBody(fontSize: 13),
                        ),
                        const SizedBox(height: 22),

                        if (sceneJson == null)
                          Text(
                            'No scene analysis was provided. '
                            'Please select a photo and try again.',
                            style: sketchBody(fontSize: 14),
                          )
                        else if (scene.allSwatches.isEmpty)
                          Text(
                            'No visual elements were detected in this photo.',
                            style: sketchBody(fontSize: 14),
                          )
                        else
                          GridView.count(
                            crossAxisCount: 4,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            mainAxisSpacing: 8,
                            crossAxisSpacing: 8,
                            children: [
                              for (final supply in scene.allSwatches)
                                AtelierTile(supply: supply),
                            ],
                          ),

                        if (scene.concepts.isNotEmpty) ...[
                          const SizedBox(height: 28),
                          Text(
                            'concepts to explore',
                            style: monoLabel(),
                          ),
                          const SizedBox(height: 12),
                          for (final concept in scene.concepts) ...[
                            _ConceptRow(
                              concept: concept,
                              onTap: () => Navigator.of(context).push(
                                risePageRoute(
                                  LearnConceptScreen(
                                    concept: concept,
                                    sessionResult: sessionResult,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                          ],
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ConceptRow extends StatelessWidget {
  final ArtConcept concept;
  final VoidCallback onTap;

  const _ConceptRow({
    required this.concept,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.paperTile,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              LineIcon(
                glyph: concept.glyph,
                size: 28,
                color: concept.accent,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      concept.title,
                      style: sketchBody(
                        fontSize: 14,
                        weight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      concept.blurb,
                      style: sketchBody(fontSize: 11.5),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_rounded,
                size: 16,
                color: AppColors.ink.withValues(alpha: 0.4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}