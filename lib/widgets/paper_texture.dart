import 'package:flutter/material.dart';

/// Faint diagonal fiber lines suggesting paper grain, painted behind content
/// on the sketchbook-styled screens.
class PaperTexture extends StatelessWidget {
  const PaperTexture({super.key});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: CustomPaint(painter: _FiberPainter(), size: Size.infinite),
    );
  }
}

class _FiberPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF7A6A3C).withValues(alpha: 0.045)
      ..strokeWidth = 1;
    const gap = 6.0;
    final diagonal = size.width + size.height;
    for (double x = -size.height; x < diagonal; x += gap) {
      canvas.drawLine(Offset(x, 0), Offset(x + size.height, size.height), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _FiberPainter oldDelegate) => false;
}
