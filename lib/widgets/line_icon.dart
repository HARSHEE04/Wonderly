import 'package:flutter/material.dart';

import '../data/models.dart';
import '../theme/app_theme.dart';

/// A delicate, single-stroke hand-drawn icon — used everywhere a discovered
/// element, concept, or mock photo needs a glyph. Deliberately not a filled
/// Material icon: thin ink lines only, the way a considered sketch reads.
class LineIcon extends StatelessWidget {
  final IconGlyph glyph;
  final double size;
  final Color color;
  final double strokeWidth;

  const LineIcon({
    super.key,
    required this.glyph,
    this.size = 26,
    this.color = AppColors.ink,
    this.strokeWidth = 1.4,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _LineIconPainter(glyph, color, strokeWidth)),
    );
  }
}

class _LineIconPainter extends CustomPainter {
  final IconGlyph glyph;
  final Color color;
  final double strokeWidth;
  _LineIconPainter(this.glyph, this.color, this.strokeWidth);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final w = size.width;
    final h = size.height;

    switch (glyph) {
      case IconGlyph.circle:
        canvas.drawCircle(Offset(w / 2, h / 2), w * 0.34, paint);
        break;
      case IconGlyph.plant:
        final path = Path()
          ..moveTo(w * 0.5, h * 0.86)
          ..lineTo(w * 0.5, h * 0.38)
          ..moveTo(w * 0.5, h * 0.46)
          ..cubicTo(w * 0.5, h * 0.2, w * 0.78, h * 0.14, w * 0.86, h * 0.1)
          ..cubicTo(w * 0.78, h * 0.34, w * 0.62, h * 0.44, w * 0.5, h * 0.46)
          ..moveTo(w * 0.5, h * 0.6)
          ..cubicTo(w * 0.5, h * 0.4, w * 0.28, h * 0.34, w * 0.2, h * 0.3)
          ..cubicTo(w * 0.26, h * 0.5, w * 0.38, h * 0.58, w * 0.5, h * 0.6);
        canvas.drawPath(path, paint);
        break;
      case IconGlyph.lines:
        canvas.drawLine(
          Offset(w * 0.24, h * 0.82),
          Offset(w * 0.24, h * 0.3),
          paint,
        );
        canvas.drawLine(
          Offset(w * 0.5, h * 0.86),
          Offset(w * 0.5, h * 0.14),
          paint,
        );
        canvas.drawLine(
          Offset(w * 0.76, h * 0.82),
          Offset(w * 0.76, h * 0.46),
          paint,
        );
        break;
      case IconGlyph.wave:
        final path = Path()
          ..moveTo(w * 0.12, h * 0.34)
          ..cubicTo(w * 0.28, h * 0.16, w * 0.4, h * 0.16, w * 0.5, h * 0.34)
          ..cubicTo(w * 0.6, h * 0.52, w * 0.72, h * 0.52, w * 0.88, h * 0.34)
          ..moveTo(w * 0.12, h * 0.62)
          ..cubicTo(w * 0.28, h * 0.44, w * 0.4, h * 0.44, w * 0.5, h * 0.62)
          ..cubicTo(w * 0.6, h * 0.8, w * 0.72, h * 0.8, w * 0.88, h * 0.62);
        canvas.drawPath(path, paint);
        break;
      case IconGlyph.stripes:
        for (int i = 0; i < 3; i++) {
          final x = w * (0.22 + i * 0.28);
          canvas.drawLine(
            Offset(x, h * 0.78),
            Offset(x + w * 0.14, h * 0.18),
            paint,
          );
        }
        break;
      case IconGlyph.spark:
        final path = Path()
          ..moveTo(w * 0.5, h * 0.1)
          ..lineTo(w * 0.58, h * 0.42)
          ..lineTo(w * 0.9, h * 0.5)
          ..lineTo(w * 0.58, h * 0.58)
          ..lineTo(w * 0.5, h * 0.9)
          ..lineTo(w * 0.42, h * 0.58)
          ..lineTo(w * 0.1, h * 0.5)
          ..lineTo(w * 0.42, h * 0.42)
          ..close();
        canvas.drawPath(path, paint);
        break;
      case IconGlyph.symmetry:
        canvas.drawLine(
          Offset(w * 0.5, h * 0.08),
          Offset(w * 0.5, h * 0.92),
          paint..strokeWidth = strokeWidth * 0.8,
        );
        canvas.drawOval(
          Rect.fromLTWH(w * 0.14, h * 0.28, w * 0.28, h * 0.2),
          paint..strokeWidth = strokeWidth,
        );
        canvas.drawOval(
          Rect.fromLTWH(w * 0.58, h * 0.28, w * 0.28, h * 0.2),
          paint,
        );
        break;
      case IconGlyph.palette:
        final path = Path()
          ..moveTo(w * 0.5, h * 0.12)
          ..cubicTo(w * 0.78, h * 0.12, w * 0.9, h * 0.34, w * 0.9, h * 0.5)
          ..cubicTo(w * 0.9, h * 0.62, w * 0.8, h * 0.6, w * 0.72, h * 0.6)
          ..cubicTo(w * 0.64, h * 0.6, w * 0.62, h * 0.7, w * 0.7, h * 0.76)
          ..cubicTo(w * 0.62, h * 0.86, w * 0.4, h * 0.88, w * 0.28, h * 0.78)
          ..cubicTo(w * 0.14, h * 0.68, w * 0.12, h * 0.44, w * 0.22, h * 0.3)
          ..cubicTo(w * 0.3, h * 0.18, w * 0.4, h * 0.12, w * 0.5, h * 0.12)
          ..close();
        canvas.drawPath(path, paint);
        break;
      case IconGlyph.perspective:
        final vp = Offset(w * 0.5, h * 0.42);
        canvas.drawLine(Offset(w * 0.08, h * 0.86), vp, paint);
        canvas.drawLine(Offset(w * 0.92, h * 0.86), vp, paint);
        canvas.drawLine(Offset(w * 0.5, h * 0.86), vp, paint);
        canvas.drawLine(
          Offset(w * 0.22, h * 0.86),
          Offset(w * 0.78, h * 0.86),
          paint,
        );
        break;
      case IconGlyph.camera:
        final body = RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.12, h * 0.32, w * 0.76, h * 0.5),
          Radius.circular(w * 0.06),
        );
        canvas.drawRRect(body, paint);
        canvas.drawLine(
          Offset(w * 0.36, h * 0.32),
          Offset(w * 0.42, h * 0.2),
          paint,
        );
        canvas.drawLine(
          Offset(w * 0.42, h * 0.2),
          Offset(w * 0.6, h * 0.2),
          paint,
        );
        canvas.drawLine(
          Offset(w * 0.6, h * 0.2),
          Offset(w * 0.66, h * 0.32),
          paint,
        );
        canvas.drawCircle(Offset(w * 0.5, h * 0.58), w * 0.16, paint);
        break;
      case IconGlyph.compass:
        canvas.drawCircle(Offset(w * 0.5, h * 0.5), w * 0.38, paint);
        final needle = Path()
          ..moveTo(w * 0.63, h * 0.32)
          ..lineTo(w * 0.52, h * 0.52)
          ..lineTo(w * 0.37, h * 0.68)
          ..lineTo(w * 0.48, h * 0.48)
          ..close();
        canvas.drawPath(needle, paint);
        canvas.drawCircle(
          Offset(w * 0.5, h * 0.5),
          w * 0.026,
          paint..style = PaintingStyle.fill,
        );
        break;
      case IconGlyph.cloud:
        final cloudPath = Path()
          ..moveTo(w * 0.28, h * 0.66)
          ..cubicTo(w * 0.16, h * 0.66, w * 0.10, h * 0.58, w * 0.10, h * 0.49)
          ..cubicTo(w * 0.10, h * 0.40, w * 0.17, h * 0.33, w * 0.26, h * 0.33)
          ..cubicTo(w * 0.28, h * 0.20, w * 0.39, h * 0.12, w * 0.51, h * 0.12)
          ..cubicTo(w * 0.64, h * 0.12, w * 0.75, h * 0.21, w * 0.77, h * 0.34)
          ..cubicTo(w * 0.87, h * 0.35, w * 0.94, h * 0.43, w * 0.94, h * 0.52)
          ..cubicTo(w * 0.94, h * 0.61, w * 0.87, h * 0.66, w * 0.78, h * 0.66)
          ..close();
        canvas.drawPath(cloudPath, paint);
        break;
    }
  }

  @override
  bool shouldRepaint(covariant _LineIconPainter oldDelegate) =>
      oldDelegate.glyph != glyph || oldDelegate.color != color;
}
