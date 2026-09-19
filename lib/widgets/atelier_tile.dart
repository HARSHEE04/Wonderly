import 'package:flutter/material.dart';
import '../data/models.dart';
import '../theme/app_theme.dart';
import 'line_icon.dart';

/// A soft square tile holding one hand-drawn line icon, a small accent dot,
/// and a lowercase label — the way discovered materials and concepts are
/// represented throughout the app instead of colorful stickers or cards.
class AtelierTile extends StatelessWidget {
  final Supply supply;
  final VoidCallback? onTap;
  final bool selected;

  const AtelierTile({super.key, required this.supply, this.onTap, this.selected = false});

  @override
  Widget build(BuildContext context) {
    final tile = AspectRatio(
      aspectRatio: 1,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.paperTile,
          borderRadius: BorderRadius.circular(16),
          border: selected ? Border.all(color: AppColors.ink, width: 1.4) : null,
        ),
        child: Stack(
          children: [
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: supply.color, shape: BoxShape.circle),
              ),
            ),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  LineIcon(glyph: supply.glyph, size: 26),
                  const SizedBox(height: 6),
                  Text(
                    supply.label.toLowerCase(),
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.4,
                      color: AppColors.inkSoft,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
    if (onTap == null) return tile;
    return GestureDetector(onTap: onTap, child: tile);
  }
}
