import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// The app's small crescent-and-dot mark, used in place of a plain wordmark.
class Logomark extends StatelessWidget {
  final double size;
  final Color shapeColor;
  final Color dotColor;

  const Logomark({
    super.key,
    this.size = 26,
    this.shapeColor = AppColors.paperLight,
    this.dotColor = AppColors.yellow,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _LogomarkPainter(shapeColor, dotColor)),
    );
  }
}

class _LogomarkPainter extends CustomPainter {
  final Color shapeColor;
  final Color dotColor;
  _LogomarkPainter(this.shapeColor, this.dotColor);

  @override
  void paint(Canvas canvas, Size size) {
    final outer = Path()..addOval(Rect.fromLTWH(0, 0, size.width, size.height));
    final innerRadius = size.width * 0.38;
    final inner = Path()
      ..addOval(Rect.fromCircle(
        center: Offset(size.width * 0.62, size.height * 0.5),
        radius: innerRadius,
      ));
    final crescent = Path.combine(PathOperation.difference, outer, inner);
    canvas.drawPath(crescent, Paint()..color = shapeColor);
    canvas.drawCircle(Offset(size.width * 0.82, size.height * 0.22), size.width * 0.09, Paint()..color = dotColor);
  }

  @override
  bool shouldRepaint(covariant _LogomarkPainter oldDelegate) =>
      oldDelegate.shapeColor != shapeColor || oldDelegate.dotColor != dotColor;
}
