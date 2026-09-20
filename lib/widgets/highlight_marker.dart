import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// An imperfect hand-drawn highlighter stroke behind [child] — a soft,
/// slightly rotated blob that overflows the text's edges unevenly, the way
/// a real highlighter pen would, instead of a perfectly aligned rectangle.
class HighlightMarker extends StatelessWidget {
  final Widget child;
  final Color color;
  final double angle;

  const HighlightMarker({
    super.key,
    required this.child,
    this.color = AppColors.yellow,
    this.angle = -0.025,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Positioned.fill(
          child: Transform.rotate(
            angle: angle,
            child: CustomPaint(painter: _HighlightPainter(color)),
          ),
        ),
        child,
      ],
    );
  }
}

class _HighlightPainter extends CustomPainter {
  final Color color;
  _HighlightPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withValues(alpha: 0.55)
      ..style = PaintingStyle.fill;
    final w = size.width;
    final h = size.height;

    // A hand-wavy blob, deliberately uneven and slightly bigger than the
    // text box it sits behind — never a clean rectangle.
    final path = Path()
      ..moveTo(w * -0.03, h * 0.2)
      ..quadraticBezierTo(w * 0.18, h * -0.12, w * 0.52, h * 0.02)
      ..quadraticBezierTo(w * 0.86, h * -0.06, w * 1.04, h * 0.24)
      ..quadraticBezierTo(w * 0.97, h * 0.52, w * 1.02, h * 0.82)
      ..quadraticBezierTo(w * 0.68, h * 1.08, w * 0.38, h * 0.94)
      ..quadraticBezierTo(w * 0.08, h * 1.05, w * -0.04, h * 0.76)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _HighlightPainter oldDelegate) =>
      oldDelegate.color != color;
}
