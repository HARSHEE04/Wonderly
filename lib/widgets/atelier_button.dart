import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/app_theme.dart';
import 'washi_tape.dart';

/// Lowercase, letter-spaced pill button, pinned down by a small strip of
/// washi tape — the scrapbook-journal accent used throughout the app.
class AtelierButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final Color fill;
  final Color textColor;
  final bool outlined;
  final Color outlineColor;
  final Color outlineTextColor;
  final bool expand;
  final bool tape;

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
    this.tape = true,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    final pill = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          width: expand ? double.infinity : null,
          padding: const EdgeInsets.symmetric(vertical: 17, horizontal: 24),
          decoration: BoxDecoration(
            color: outlined
                ? Colors.transparent
                : (enabled ? fill : fill.withValues(alpha: 0.35)),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: (outlined ? outlineColor : AppColors.ink).withValues(
                alpha: outlined ? 0.4 : 1,
              ),
              width: 1.4,
            ),
            boxShadow: (!outlined && enabled)
                ? [
                    BoxShadow(
                      color: fill.withValues(alpha: 0.35),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label.toLowerCase(),
            textAlign: TextAlign.center,
            style: GoogleFonts.karla(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.1,
              color: outlined ? outlineTextColor : textColor,
            ),
          ),
        ),
      ),
    );

    if (!tape) return pill;

    return Padding(
      padding: const EdgeInsets.only(top: 11),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          pill,
          Positioned(
            top: -11,
            left: outlined ? null : 18,
            right: outlined ? 18 : null,
            child: WashiTape(
              color: outlined ? AppColors.sky : AppColors.coral,
              angle: outlined ? 0.14 : -0.16,
            ),
          ),
        ],
      ),
    );
  }
}
