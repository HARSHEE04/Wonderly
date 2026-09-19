import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_tile.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import 'learn_concept_screen.dart';

class LearnFoundScreen extends StatelessWidget {
  const LearnFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final scene = mockSceneAnalysis;
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
                      CircleIconButton(icon: Icons.arrow_back_ios_new_rounded, onTap: () => Navigator.of(context).pop()),
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
                              TextSpan(text: 'found', style: TextStyle(backgroundColor: Color(0x66FFCB3D))),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text('${scene.allSwatches.length} elements, ${scene.concepts.length} concepts worth exploring', style: sketchBody(fontSize: 13)),
                        const SizedBox(height: 22),
                        GridView.count(
                          crossAxisCount: 4,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          mainAxisSpacing: 8,
                          crossAxisSpacing: 8,
                          children: [for (final s in scene.allSwatches) AtelierTile(supply: s)],
                        ),
                        const SizedBox(height: 28),
                        Text('concepts to explore', style: monoLabel()),
                        const SizedBox(height: 12),
                        for (final concept in scene.concepts) ...[
                          _ConceptRow(
                            concept: concept,
                            onTap: () => Navigator.of(context).push(risePageRoute(LearnConceptScreen(concept: concept))),
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
  final ArtConcept concept;
  final VoidCallback onTap;
  const _ConceptRow({required this.concept, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.paperTile, borderRadius: BorderRadius.circular(16)),
          child: Row(
            children: [
              LineIcon(glyph: concept.glyph, size: 28, color: concept.accent),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(concept.title, style: sketchBody(fontSize: 14, weight: FontWeight.w700, color: AppColors.ink)),
                    const SizedBox(height: 2),
                    Text(concept.blurb, style: sketchBody(fontSize: 11.5)),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.ink.withValues(alpha: 0.4)),
            ],
          ),
        ),
      ),
    );
  }
}
