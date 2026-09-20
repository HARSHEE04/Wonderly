import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../widgets/washi_tape.dart';
import '../services/api_client.dart';
import 'learn_challenge_screen.dart';

class LearnConceptScreen extends StatelessWidget {
  final LearningElement element;
  final LearnSessionResult? sessionResult;
  const LearnConceptScreen({
    super.key,
    required this.element,
    this.sessionResult,
  });

  @override
  Widget build(BuildContext context) {
    final accent = _accentFor(element.category);
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 26),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  CircleIconButton(
                    icon: Icons.arrow_back_ios_new_rounded,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(height: 20),
                  Text('we found', style: monoLabel(color: accent)),
                  const SizedBox(height: 6),
                  Text(element.name, style: editorialDisplay(fontSize: 32)),
                  const SizedBox(height: 18),
                  Center(
                    child: Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        color: AppColors.paperLight,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.ink.withValues(alpha: 0.08),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Center(
                        child: LineIcon(
                          glyph: _glyphFor(element.category),
                          size: 76,
                          color: accent,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(element.description, style: sketchBody(fontSize: 16.5)),
                  const SizedBox(height: 20),
                  ...[
                    Text('how artists use it', style: monoLabel()),
                    const SizedBox(height: 16),
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Positioned(
                          top: -14,
                          right: 24,
                          child: WashiTape(
                            color:
                                AppColors.tapePalette[element.name.hashCode %
                                    AppColors.tapePalette.length],
                            angle: 0.16,
                            width: 16,
                            height: 34,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.paperTile,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: AppColors.ink.withValues(
                                      alpha: 0.16,
                                    ),
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  element.category,
                                  style: monoLabel(fontSize: 11),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                element.artisticUse,
                                style: sketchBody(
                                  fontSize: 16.5,
                                  weight: FontWeight.w700,
                                  color: AppColors.ink,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                element.effect,
                                style: sketchBody(fontSize: 14.5),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                element.howToUse,
                                style: monoLabel(fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 32),
                  AtelierButton(
                    label: 'try it',
                    fill: AppColors.ink,
                    onTap: () => Navigator.of(context).push(
                      risePageRoute(
                        LearnChallengeScreen(
                          element: element,
                          sessionResult: sessionResult,
                        ),
                      ),
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
