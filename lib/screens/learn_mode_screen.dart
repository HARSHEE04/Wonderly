import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../data/models.dart';
import 'learn_scan_screen.dart';

enum ScanMode { photo, continuous }

class LearnModeScreen extends StatelessWidget {
  const LearnModeScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
                  const SizedBox(height: 22),
                  Text('learn · discover', style: monoLabel()),
                  const SizedBox(height: 8),
                  Text('See what\'s around you.', style: editorialDisplay(fontSize: 26)),
                  const SizedBox(height: 6),
                  Text(
                    'Choose how you\'d like to look.',
                    style: sketchBody(fontSize: 14),
                  ),
                  const SizedBox(height: 28),
                  _ModeRow(
                    glyph: IconGlyph.camera,
                    title: 'take a photo',
                    subtitle: 'one still frame, analyzed once',
                    onTap: () => Navigator.of(context).push(
                      risePageRoute(const LearnScanScreen(mode: ScanMode.photo)),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _ModeRow(
                    glyph: IconGlyph.spark,
                    title: 'continuous scan',
                    subtitle: 'sweep the room as you go',
                    onTap: () => Navigator.of(context).push(
                      risePageRoute(const LearnScanScreen(mode: ScanMode.continuous)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ModeRow extends StatelessWidget {
  final IconGlyph glyph;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ModeRow({required this.glyph, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.paperTile,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              LineIcon(glyph: glyph, size: 28),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: sketchBody(fontSize: 14.5, weight: FontWeight.w700, color: AppColors.ink)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: sketchBody(fontSize: 11.5)),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_rounded, size: 18, color: AppColors.ink.withValues(alpha: 0.4)),
            ],
          ),
        ),
      ),
    );
  }
}
