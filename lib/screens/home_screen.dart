import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../data/models.dart';
import 'create_challenge_screen.dart';
import 'learn_mode_screen.dart';
import 'library_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          Positioned(
            bottom: 120,
            right: -30,
            child: Opacity(
              opacity: 0.12,
              child: LineIcon(
                glyph: IconGlyph.circle,
                size: 160,
                color: AppColors.ink,
                strokeWidth: 1.2,
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 26),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const SizedBox(width: 38),
                      Text(
                        'wonderly',
                        style: monoLabel(
                          fontSize: 11,
                          color: AppColors.ink,
                          letterSpacing: 3,
                        ),
                      ),
                      CircleIconButton(
                        icon: Icons.grid_view_rounded,
                        onTap: () =>
                            Navigator.of(context)
                                .push(risePageRoute(const LibraryScreen())),
                        filled: false,
                      ),
                    ],
                  ),
                  const Spacer(flex: 3),
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'What can you learn from\nwhat\'s around you?',
                          textAlign: TextAlign.center,
                          style: sketchDisplay(
                            fontSize: 27,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Point your camera. Discover. Experiment. Create.',
                          textAlign: TextAlign.center,
                          style: sketchBody(
                            fontSize: 14,
                            weight: FontWeight.w600,
                            color: AppColors.inkSoft,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(flex: 4),
                  AtelierButton(
                    label: 'create',
                    fill: AppColors.yellow,
                    textColor: AppColors.ink,
                    onTap: () =>
                        Navigator.of(context)
                            .push(risePageRoute(const CreateChallengeScreen())),
                  ),
                  const SizedBox(height: 12),
                  AtelierButton(
                    label: 'learn',
                    outlined: true,
                    outlineColor: AppColors.ink,
                    outlineTextColor: AppColors.ink,
                    onTap: () =>
                        Navigator.of(context)
                            .push(risePageRoute(const LearnModeScreen())),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
