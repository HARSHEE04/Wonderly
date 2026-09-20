import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/brand_mark.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/paper_texture.dart';
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
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 26),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight,
                    ),
                    child: IntrinsicHeight(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const SizedBox(width: 38),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const BrandMark(size: 26),
                                  const SizedBox(width: 8),
                                  Text(
                                    'wonderly',
                                    style: monoLabel(
                                      fontSize: 13,
                                      color: AppColors.ink,
                                      letterSpacing: 3,
                                    ),
                                  ),
                                ],
                              ),
                              CircleIconButton(
                                icon: Icons.grid_view_rounded,
                                onTap: () => Navigator.of(context)
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
                                  'Start with wonder.',
                                  textAlign: TextAlign.center,
                                  style: sketchDisplay(
                                    fontSize: 36,
                                    color: AppColors.ink,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Explore the world around you, discover something new, and create.',
                                  textAlign: TextAlign.center,
                                  style: sketchBody(
                                    fontSize: 16,
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
                            tapeColor: AppColors.tapePink,
                            tapeOnLeft: true,
                            onTap: () => Navigator.of(context).push(
                              risePageRoute(const CreateChallengeScreen()),
                            ),
                          ),
                          const SizedBox(height: 12),
                          AtelierButton(
                            label: 'learn',
                            fill: AppColors.yellow,
                            textColor: AppColors.ink,
                            tapeColor: AppColors.tapeBlue,
                            tapeOnLeft: false,
                            onTap: () => Navigator.of(context)
                                .push(risePageRoute(const LearnModeScreen())),
                          ),
                          const SizedBox(height: 28),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
