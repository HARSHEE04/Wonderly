import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/mock_data.dart';
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
  const LearnFoundScreen({super.key, this.sessionResult});

  @override
  Widget build(BuildContext context) {
    final scene = mockSceneAnalysis;
    final learningContent = sessionResult?.learningContent;
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
                            style: sketchDisplay(fontSize: 36),
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
                          learningContent?.summary ?? 'Learning content is unavailable. Go back and scan again.',
                          style: sketchBody(fontSize: 15),
                        ),
                        const SizedBox(height: 22),
                        GridView.count(
                          crossAxisCount: 4,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          mainAxisSpacing: 8,
                          crossAxisSpacing: 8,
                          children: [
                            for (final s in scene.allSwatches)
                              AtelierTile(supply: s),
                          ],
                        ),
                        const SizedBox(height: 28),
                        Text('concepts to explore', style: monoLabel()),
                        const SizedBox(height: 12),
                        for (final element
                            in learningContent?.elements ??
                                const <LearningElement>[]) ...[
                          _ConceptRow(
                            element: element,
                            onTap: () => Navigator.of(context).push(
                              risePageRoute(
                                LearnConceptScreen(
                                  element: element,
                                  sessionResult: sessionResult,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
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
  final LearningElement element;
  final VoidCallback onTap;
  const _ConceptRow({required this.element, required this.onTap});

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
                glyph: _glyphFor(element.category),
                size: 28,
                color: _accentFor(element.category),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      element.name,
                      style: sketchBody(
                        fontSize: 16,
                        weight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      element.description,
                      style: sketchBody(fontSize: 13.5),
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

IconGlyph _glyphFor(String category) => switch (category) {
  'color' => IconGlyph.palette,
  'line' => IconGlyph.lines,
  'texture' => IconGlyph.wave,
  'pattern' => IconGlyph.stripes,
  _ => IconGlyph.circle,
};

Color _accentFor(String category) => switch (category) {
  'color' => AppColors.coral,
  'line' => AppColors.sky,
  'texture' => AppColors.forestGreen,
  'pattern' => AppColors.pinkDeep,
  _ => AppColors.violet,
};
