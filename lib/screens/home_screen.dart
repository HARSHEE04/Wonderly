import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_theme.dart';
import '../data/models.dart';
import '../peer_learning/peer_discovery_screen.dart';
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
                  const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _ChecklistItem(
                          'Explore the world around you',
                          rotationDegrees: -1.4,
                        ),
                        SizedBox(height: 14),
                        _ChecklistItem(
                          'Discover something new',
                          rotationDegrees: 1.6,
                        ),
                        SizedBox(height: 14),
                        _ChecklistItem('Create', rotationDegrees: -0.7),
                      ],
                    ),
                  ),
                  const SizedBox(height: 90),
                  AtelierButton(
                    label: 'create',
                    fill: AppColors.yellow,
                    textColor: AppColors.ink,
                    tapeColor: AppColors.tapePink,
                    tapeOnLeft: true,
                    fontSize: 17,
                    onTap: () => Navigator.of(context).push(
                      risePageRoute(
                        const LearnScanScreen(
                          mode: ScanMode.continuous,
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
                    fontSize: 17,
                    onTap: () =>
                        Navigator.of(context)
                            .push(risePageRoute(const LearnModeScreen())),
                  ),
                  const SizedBox(height: 12),
                  AtelierButton(
                    label: 'peer learning',
                    fill: AppColors.paperLight,
                    textColor: AppColors.ink,
                    tapeColor: AppColors.tapeGreen,
                    tapeOnLeft: true,
                    fontSize: 17,
                    onTap: () =>
                        Navigator.of(context)
                            .push(risePageRoute(const PeerDiscoveryScreen())),
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

/// One row of the onboarding checklist, rendered as a small paper "sticker"
/// card — a hand-drawn spark checkbox paired with a short line of the
/// "explore, discover, create" promise. Each card sits at a slight,
/// per-item rotation like something taped onto the page, and straightens
/// out with a deeper shadow on press for a tactile, physical feel.
class _ChecklistItem extends StatefulWidget {
  final String label;
  final double rotationDegrees;
  const _ChecklistItem(this.label, {this.rotationDegrees = 0});

  @override
  State<_ChecklistItem> createState() => _ChecklistItemState();
}

class _ChecklistItemState extends State<_ChecklistItem> {
  bool _pressed = false;

  void _setPressed(bool value) {
    if (_pressed == value) return;
    setState(() => _pressed = value);
    if (value) HapticFeedback.selectionClick();
  }

  @override
  Widget build(BuildContext context) {
    final restAngle = widget.rotationDegrees * math.pi / 180;
    return GestureDetector(
      onTapDown: (_) => _setPressed(true),
      onTapUp: (_) => _setPressed(false),
      onTapCancel: () => _setPressed(false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        transformAlignment: Alignment.center,
        transform: Matrix4.identity()
          ..rotateZ(_pressed ? 0 : restAngle)
          ..scaleByDouble(
            _pressed ? 1.03 : 1.0,
            _pressed ? 1.03 : 1.0,
            1.0,
            1.0,
          ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.paperLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.ink.withValues(alpha: 0.1),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink.withValues(alpha: _pressed ? 0.22 : 0.1),
              blurRadius: _pressed ? 18 : 7,
              offset: Offset(0, _pressed ? 10 : 3),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: AppColors.paper,
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
            Flexible(
              child: Text(
                widget.label,
                style: sketchDisplay(fontSize: 21, color: AppColors.inkSoft),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
