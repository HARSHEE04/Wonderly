import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/logomark.dart';
import '../data/models.dart';
import 'create_challenge_screen.dart';
import 'learn_mode_screen.dart';
import 'library_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ink,
      body: Stack(
        children: [
          Positioned(
            top: -30,
            left: -40,
            child: Opacity(
              opacity: 0.14,
              child: LineIcon(glyph: IconGlyph.plant, size: 220, color: AppColors.paperLight, strokeWidth: 1.2),
            ),
          ),
          Positioned(
            bottom: 120,
            right: -30,
            child: Opacity(
              opacity: 0.12,
              child: LineIcon(glyph: IconGlyph.circle, size: 160, color: AppColors.paperLight, strokeWidth: 1.2),
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
                      Column(
                        children: [
                          const Logomark(),
                          const SizedBox(height: 8),
                          Text(
                            'sift',
                            style: monoLabel(fontSize: 11, color: AppColors.paperLight, letterSpacing: 3),
                          ),
                        ],
                      ),
                      CircleIconButton(
                        icon: Icons.grid_view_rounded,
                        onTap: () => Navigator.of(context).push(risePageRoute(const LibraryScreen())),
                        filled: false,
                      ),
                    ],
                  ),
                  const Spacer(flex: 3),
                  Center(
                    child: Text.rich(
                      TextSpan(
                        style: sketchDisplay(fontSize: 30, color: AppColors.paperLight),
                        children: const [
                          TextSpan(text: 'everything around\nyou is '),
                          TextSpan(text: 'material', style: TextStyle(color: AppColors.yellow)),
                        ],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const Spacer(flex: 4),
                  AtelierButton(
                    label: 'create',
                    fill: AppColors.yellow,
                    textColor: AppColors.ink,
                    onTap: () => Navigator.of(context).push(risePageRoute(const CreateChallengeScreen())),
                  ),
                  const SizedBox(height: 12),
                  AtelierButton(
                    label: 'learn',
                    outlined: true,
                    outlineColor: AppColors.paperLight,
                    outlineTextColor: AppColors.paperLight,
                    onTap: () => Navigator.of(context).push(risePageRoute(const LearnModeScreen())),
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
