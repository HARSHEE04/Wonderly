import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// A small rotated strip of "washi tape" — the scrapbook-journal accent used
/// to pin buttons, photos, and clippings across the app. Always positioned
/// by the caller (inside a `Stack(clipBehavior: Clip.none)`), overlapping
/// the edge of whatever it's "pinning" down.
class WashiTape extends StatelessWidget {
  final Color color;
  final double angle;
  final double width;
  final double height;

  const WashiTape({
    super.key,
    this.color = AppColors.tapePink,
    this.angle = -0.16,
    this.width = 17,
    this.height = 36,
  });

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Transform.rotate(
        angle: angle,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.88),
            boxShadow: [
              BoxShadow(
                color: AppColors.ink.withValues(alpha: 0.15),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
