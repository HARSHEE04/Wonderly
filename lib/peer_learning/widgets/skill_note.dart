import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';

class SkillNote extends StatelessWidget {
  final String title;
  final List<String> skills;
  final Color color;
  final String emptyLabel;
  final double angle;

  const SkillNote({
    super.key,
    required this.title,
    required this.skills,
    required this.color,
    required this.emptyLabel,
    this.angle = 0,
  });

  @override
  Widget build(BuildContext context) {
    final visibleSkills = skills.isEmpty ? [emptyLabel] : skills;
    return Transform.rotate(
      angle: angle * math.pi / 180,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: skills.isEmpty ? 0.28 : 0.72),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: AppColors.ink.withValues(alpha: 0.16),
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: monoLabel(
                fontSize: 10,
                color: AppColors.ink.withValues(alpha: 0.72),
                letterSpacing: 0,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 7,
              runSpacing: 7,
              children: [
                for (final skill in visibleSkills)
                  _SkillChip(label: skill, muted: skills.isEmpty),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SkillChip extends StatelessWidget {
  final String label;
  final bool muted;

  const _SkillChip({required this.label, required this.muted});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.paperLight.withValues(alpha: muted ? 0.45 : 0.78),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: AppColors.ink.withValues(alpha: muted ? 0.08 : 0.14),
          width: 1,
        ),
      ),
      child: Text(
        label,
        style: sketchBody(
          fontSize: 13,
          weight: FontWeight.w700,
          color: muted
              ? AppColors.inkSoft.withValues(alpha: 0.7)
              : AppColors.ink,
        ),
      ),
    );
  }
}
