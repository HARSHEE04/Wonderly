import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// A slightly crooked Post-it card — the scrapbook-journal treatment for a
/// block of content that reads as something physically stuck onto the page,
/// complete with a lifted-corner fold and a soft drop shadow.
class StickyNote extends StatelessWidget {
  final Widget child;
  final Color color;
  final double angle;

  const StickyNote({
    super.key,
    required this.child,
    this.color = AppColors.stickyNote,
    this.angle = -0.012,
  });

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: angle,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          boxShadow: [
            BoxShadow(
              color: AppColors.ink.withValues(alpha: 0.16),
              blurRadius: 18,
              offset: const Offset(5, 12),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            Padding(padding: const EdgeInsets.all(22), child: child),
            Positioned(
              top: 0,
              right: 0,
              child: CustomPaint(
                size: const Size(26, 26),
                painter: _FoldPainter(color),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FoldPainter extends CustomPainter {
  final Color noteColor;
  _FoldPainter(this.noteColor);

  @override
  void paint(Canvas canvas, Size size) {
    final fold = Path()
      ..moveTo(size.width, 0)
      ..lineTo(size.width, size.height)
      ..lineTo(0, 0)
      ..close();
    canvas.drawPath(
      fold,
      Paint()..color = AppColors.ink.withValues(alpha: 0.08),
    );

    final corner = Path()
      ..moveTo(size.width, 0)
      ..lineTo(size.width, size.height * 0.62)
      ..lineTo(size.width * 0.38, 0)
      ..close();
    canvas.drawPath(corner, Paint()..color = AppColors.stickyNoteFold);
  }

  @override
  bool shouldRepaint(covariant _FoldPainter oldDelegate) =>
      oldDelegate.noteColor != noteColor;
}
