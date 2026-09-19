import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Lowercase, letter-spaced pill button — the restrained, soft-shadow
/// language used everywhere instead of hard cartoon offsets or stickers.
class AtelierButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final Color fill;
  final Color textColor;
  final bool outlined;
  final Color outlineColor;
  final Color outlineTextColor;
  final bool expand;

  const AtelierButton({
    super.key,
    required this.label,
    required this.onTap,
    this.fill = AppColors.ink,
    this.textColor = AppColors.paperLight,
    this.outlined = false,
    this.outlineColor = AppColors.ink,
    this.outlineTextColor = AppColors.ink,
    this.expand = true,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    final child = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          width: expand ? double.infinity : null,
          padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 22),
          decoration: BoxDecoration(
            color: outlined ? Colors.transparent : (enabled ? fill : fill.withValues(alpha: 0.35)),
            borderRadius: BorderRadius.circular(24),
            border: outlined ? Border.all(color: outlineColor.withValues(alpha: 0.4), width: 1.4) : null,
            boxShadow: (!outlined && enabled)
                ? [BoxShadow(color: fill.withValues(alpha: 0.35), blurRadius: 18, offset: const Offset(0, 8))]
                : null,
          ),
          child: Text(
            label.toLowerCase(),
            textAlign: TextAlign.center,
            style: GoogleFonts.karla(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.6,
              color: outlined ? outlineTextColor : textColor,
            ),
          ),
        ),
      ),
    );
    return child;
  }
}
