import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Ink-bordered circular icon button used for back/close/undo actions on
/// the sketchbook-themed screens.
class CircleIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final double size;
  final bool filled;

  const CircleIconButton({
    super.key,
    required this.icon,
    required this.onTap,
    this.size = 38,
    this.filled = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: filled ? AppColors.ink : AppColors.paper,
          border: Border.all(color: AppColors.ink, width: 1.6),
        ),
        child: Icon(
          icon,
          color: filled ? AppColors.paper : AppColors.ink,
          size: size * 0.42,
        ),
      ),
    );
  }
}
