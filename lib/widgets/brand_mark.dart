import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// The Wonderly mark — a spark catching at the top of a cloud. Replaces the
/// old crescent-moon logomark with something that actually reads as
/// "noticing something in the everyday."
class BrandMark extends StatelessWidget {
  final double size;
  final Color cloudColor;
  final Color sparkColor;

  const BrandMark({
    super.key,
    this.size = 32,
    this.cloudColor = AppColors.ink,
    this.sparkColor = AppColors.yellow,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _BrandMarkPainter(cloudColor, sparkColor)),
    );
  }
}

class _BrandMarkPainter extends CustomPainter {
  final Color cloudColor;
  final Color sparkColor;
  _BrandMarkPainter(this.cloudColor, this.sparkColor);

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final cloudPath = Path()
      ..moveTo(w * 0.28, h * 0.70)
      ..cubicTo(w * 0.16, h * 0.70, w * 0.10, h * 0.62, w * 0.10, h * 0.53)
      ..cubicTo(w * 0.10, h * 0.44, w * 0.17, h * 0.37, w * 0.26, h * 0.37)
      ..cubicTo(w * 0.28, h * 0.24, w * 0.39, h * 0.16, w * 0.51, h * 0.16)
      ..cubicTo(w * 0.64, h * 0.16, w * 0.75, h * 0.25, w * 0.77, h * 0.38)
      ..cubicTo(w * 0.87, h * 0.39, w * 0.94, h * 0.47, w * 0.94, h * 0.56)
      ..cubicTo(w * 0.94, h * 0.65, w * 0.87, h * 0.70, w * 0.78, h * 0.70)
      ..close();
    canvas.drawPath(
      cloudPath,
      Paint()
        ..color = cloudColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.045
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );

    final sparkPath = Path()
      ..moveTo(w * 0.58, h * 0.04)
      ..lineTo(w * 0.62, h * 0.22)
      ..lineTo(w * 0.80, h * 0.26)
      ..lineTo(w * 0.62, h * 0.30)
      ..lineTo(w * 0.58, h * 0.48)
      ..lineTo(w * 0.54, h * 0.30)
      ..lineTo(w * 0.36, h * 0.26)
      ..lineTo(w * 0.54, h * 0.22)
      ..close();
    canvas.drawPath(sparkPath, Paint()..color = sparkColor);
    canvas.drawPath(
      sparkPath,
      Paint()
        ..color = cloudColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.02
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(covariant _BrandMarkPainter oldDelegate) =>
      oldDelegate.cloudColor != cloudColor ||
      oldDelegate.sparkColor != sparkColor;
}
