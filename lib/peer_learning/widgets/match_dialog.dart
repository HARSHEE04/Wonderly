import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';
import '../../widgets/atelier_button.dart';
import '../../widgets/line_icon.dart';
import '../../widgets/washi_tape.dart';
import '../models/peer_profile.dart';

class MatchDialog extends StatelessWidget {
  final PeerProfile profile;
  final DemoLearner learner;

  const MatchDialog({super.key, required this.profile, required this.learner});

  @override
  Widget build(BuildContext context) {
    final theyTeach = profile.skillsTheyCanTeach(learner);
    final youTeach = profile.skillsYouCanTeach(learner);

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 22),
            decoration: BoxDecoration(
              color: AppColors.paperLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.ink, width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: AppColors.ink.withValues(alpha: 0.25),
                  blurRadius: 26,
                  offset: const Offset(0, 16),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: LineIcon(
                    glyph: profile.glyph,
                    size: 42,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  "It's a learning match!",
                  textAlign: TextAlign.center,
                  style: sketchDisplay(fontSize: 32, color: AppColors.ink),
                ),
                const SizedBox(height: 8),
                Text(
                  'You and ${profile.name} have something to trade.',
                  textAlign: TextAlign.center,
                  style: sketchBody(
                    fontSize: 15,
                    weight: FontWeight.w500,
                    color: AppColors.inkSoft,
                  ),
                ),
                const SizedBox(height: 20),
                _MatchLine(
                  title: '${profile.name} can teach you',
                  skills: theyTeach,
                  color: profile.accentColor,
                ),
                const SizedBox(height: 10),
                _MatchLine(
                  title: 'You can teach ${profile.name}',
                  skills: youTeach,
                  color: AppColors.yellow,
                ),
                const SizedBox(height: 22),
                AtelierButton(
                  label: 'start learning together',
                  onTap: () => Navigator.of(context).pop(),
                  fill: AppColors.ink,
                  textColor: AppColors.paperLight,
                  tapeColor: AppColors.tapeGreen,
                  fontSize: 14,
                ),
              ],
            ),
          ),
          Positioned(
            top: -15,
            left: 42,
            child: WashiTape(
              color: profile.tapeColor,
              angle: -0.14,
              width: 84,
              height: 28,
            ),
          ),
        ],
      ),
    );
  }
}

class _MatchLine extends StatelessWidget {
  final String title;
  final List<String> skills;
  final Color color;

  const _MatchLine({
    required this.title,
    required this.skills,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.38),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: AppColors.ink.withValues(alpha: 0.14),
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
              color: AppColors.inkSoft,
              letterSpacing: 0,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            skills.join(', '),
            style: sketchBody(
              fontSize: 15,
              weight: FontWeight.w800,
              color: AppColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}
