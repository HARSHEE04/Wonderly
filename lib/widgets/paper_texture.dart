import 'package:flutter/material.dart';

/// Faint graph-paper grid painted behind content — the fine-ruled background
/// from the reference mockups, used on every screen in the app. [color]
/// defaults to a warm ink line for the paper/cream screens; pass a light
/// color (e.g. [Color.paperLight]) on dark ink/navy screens instead.
class PaperTexture extends StatelessWidget {
  final Color color;
  final double opacity;

  const PaperTexture({
    super.key,
    this.color = const Color(0xFF7A6A3C),
    this.opacity = 0.055,
  });

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: CustomPaint(
        painter: _GridPainter(color.withValues(alpha: opacity)),
        size: Size.infinite,
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  final Color color;
  _GridPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;
    const gap = 18.0;

    for (double x = 0; x <= size.width; x += gap) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y <= size.height; y += gap) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _GridPainter oldDelegate) =>
      oldDelegate.color != color;
}
