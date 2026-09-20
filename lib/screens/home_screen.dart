import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/brand_mark.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import 'learn_mode_screen.dart';
import 'learn_scan_screen.dart';
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
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 26),
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
                        onTap: () =>
                            Navigator.of(context)
                                .push(risePageRoute(const LibraryScreen())),
                        filled: false,
                      ),
                    ],
                  ),
                  const SizedBox(height: 90),
                  Text(
                    'Start with wonder.',
                    textAlign: TextAlign.center,
                    style: sketchDisplay(fontSize: 36, color: AppColors.ink),
                  ),
                  const SizedBox(height: 20),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _ChecklistItem('Explore the world around you'),
                      SizedBox(height: 10),
                      _ChecklistItem('Discover something new'),
                      SizedBox(height: 10),
                      _ChecklistItem('Create'),
                    ],
                  ),
                  const SizedBox(height: 90),
                  AtelierButton(
                    label: 'create',
                    fill: AppColors.yellow,
                    textColor: AppColors.ink,
                    tapeColor: AppColors.tapePink,
                    tapeOnLeft: true,
                    onTap: () => Navigator.of(context).push(
                      risePageRoute(
                        const LearnScanScreen(
                          mode: ScanMode.photo,
                          origin: 'Create',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  AtelierButton(
                    label: 'learn',
                    fill: AppColors.yellow,
                    textColor: AppColors.ink,
                    tapeColor: AppColors.tapeBlue,
                    tapeOnLeft: false,
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

/// One row of the onboarding checklist, a small squared checkbox holding a
/// hand-drawn spark instead of a plain checkmark, paired with a short line
/// of the "explore, discover, create" promise.
class _ChecklistItem extends StatelessWidget {
  final String label;
  const _ChecklistItem(this.label);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: AppColors.paperLight,
            border: Border.all(color: AppColors.ink, width: 1.4),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Center(
            child: LineIcon(
              glyph: IconGlyph.spark,
              size: 13,
              color: AppColors.ink,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              label,
              style: sketchBody(
                fontSize: 16,
                weight: FontWeight.w600,
                color: AppColors.inkSoft,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
