import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../services/api_client.dart';
import 'learn_challenge_screen.dart';

class LearnConceptScreen extends StatelessWidget {
  final ArtConcept concept;
  final LearnSessionResult? sessionResult;
  const LearnConceptScreen({super.key, required this.concept, this.sessionResult});

  @override
  Widget build(BuildContext context) {
    final resource = mockLearningResources[concept.id];
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 26),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  CircleIconButton(icon: Icons.arrow_back_ios_new_rounded, onTap: () => Navigator.of(context).pop()),
                  const SizedBox(height: 20),
                  Text('we found', style: monoLabel(color: concept.accent)),
                  const SizedBox(height: 6),
                  Text(concept.title, style: editorialDisplay(fontSize: 30)),
                  const SizedBox(height: 18),
                  Center(
                    child: Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        color: AppColors.paperLight,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [BoxShadow(color: AppColors.ink.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, 10))],
                      ),
                      child: Center(child: LineIcon(glyph: concept.glyph, size: 76, color: concept.accent)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(concept.blurb, style: sketchBody(fontSize: 14.5)),
                  const SizedBox(height: 20),
                  if (resource != null) ...[
                    Text('from around the web', style: monoLabel()),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: AppColors.paperTile, borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.ink.withValues(alpha: 0.16)),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(resource.source.toLowerCase(), style: monoLabel(fontSize: 9)),
                          ),
                          const SizedBox(height: 10),
                          Text(resource.title, style: sketchBody(fontSize: 14.5, weight: FontWeight.w700, color: AppColors.ink)),
                          const SizedBox(height: 6),
                          Text(resource.summary, style: sketchBody(fontSize: 12.5)),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Icon(Icons.north_east_rounded, size: 13, color: AppColors.ink.withValues(alpha: 0.5)),
                              const SizedBox(width: 5),
                              Expanded(
                                child: Text(
                                  resource.url,
                                  overflow: TextOverflow.ellipsis,
                                  style: monoLabel(fontSize: 9.5, color: AppColors.ink.withValues(alpha: 0.5)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                  const Spacer(),
                  AtelierButton(
                    label: 'try it',
                    fill: AppColors.ink,
                    onTap: () => Navigator.of(context).push(
                      risePageRoute(LearnChallengeScreen(concept: concept, sessionResult: sessionResult)),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
