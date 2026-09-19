import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Thin corner brackets over a camera-style panel — the restrained
/// "viewfinder" chrome used for every capture/scan moment instead of a
/// heavy tech overlay.
class ViewfinderFrame extends StatelessWidget {
  final Color color;
  const ViewfinderFrame({super.key, this.color = AppColors.paperLight});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: CustomPaint(painter: _CornerPainter(color)),
      ),
    );
  }
}

class _CornerPainter extends CustomPainter {
  final Color color;
  _CornerPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    const len = 18.0;
    final corners = [Offset.zero, Offset(size.width, 0), Offset(0, size.height), Offset(size.width, size.height)];
    for (final c in corners) {
      final dx = c.dx == 0 ? 1.0 : -1.0;
      final dy = c.dy == 0 ? 1.0 : -1.0;
      canvas.drawLine(c, c + Offset(len * dx, 0), paint);
      canvas.drawLine(c, c + Offset(0, len * dy), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _CornerPainter oldDelegate) => oldDelegate.color != color;
}
