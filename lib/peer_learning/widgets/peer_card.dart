import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';
import '../../widgets/line_icon.dart';
import '../../widgets/washi_tape.dart';
import '../models/peer_profile.dart';
import 'skill_note.dart';

class PeerCard extends StatelessWidget {
  final PeerProfile profile;
  final DemoLearner learner;
  final double dragProgress;

  const PeerCard({
    super.key,
    required this.profile,
    required this.learner,
    this.dragProgress = 0,
  });

  @override
  Widget build(BuildContext context) {
    final theyTeach = profile.skillsTheyCanTeach(learner);
    final youTeach = profile.skillsYouCanTeach(learner);
    final mutual = profile.isMutualWith(learner);
    final connectOpacity = dragProgress.clamp(0.0, 1.0);
    final passOpacity = (-dragProgress).clamp(0.0, 1.0);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          decoration: BoxDecoration(
            color: AppColors.paperLight,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.ink, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: AppColors.ink.withValues(alpha: 0.18),
                blurRadius: 24,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: SingleChildScrollView(
            physics: const ClampingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(22, 22, 22, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ProfilePhoto(profile: profile),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              profile.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: sketchDisplay(
                                fontSize: 38,
                                color: AppColors.ink,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              profile.role,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: monoLabel(
                                fontSize: 11,
                                color: AppColors.inkSoft,
                                letterSpacing: 0,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  profile.bio,
                  style: sketchBody(
                    fontSize: 15,
                    weight: FontWeight.w500,
                    color: AppColors.inkSoft,
                  ),
                ),
                const SizedBox(height: 18),
                SkillNote(
                  title: 'THEY CAN TEACH YOU',
                  skills: theyTeach,
                  emptyLabel: 'Not on your list yet',
                  color: profile.accentColor,
                  angle: -0.45,
                ),
                const SizedBox(height: 12),
                SkillNote(
                  title: '${profile.name.toUpperCase()} WANTS TO LEARN',
                  skills: profile.wantsToLearn,
                  emptyLabel: 'Open studio practice',
                  color: AppColors.stickyNote,
                  angle: 0.35,
                ),
                const SizedBox(height: 12),
                SkillNote(
                  title: 'YOU CAN TEACH',
                  skills: youTeach,
                  emptyLabel: 'No overlap yet',
                  color: AppColors.tapePink,
                  angle: -0.2,
                ),
                const SizedBox(height: 18),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: mutual
                        ? AppColors.yellow.withValues(alpha: 0.75)
                        : AppColors.paper,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.ink.withValues(alpha: 0.18),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      LineIcon(
                        glyph: profile.glyph,
                        size: 24,
                        color: AppColors.ink,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          mutual
                              ? 'Mutual learning match'
                              : 'Useful peer connection',
                          style: sketchBody(
                            fontSize: 15,
                            weight: FontWeight.w800,
                            color: AppColors.ink,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        Positioned(
          top: -16,
          left: 32,
          child: WashiTape(
            color: profile.tapeColor,
            angle: -0.18,
            width: 72,
            height: 28,
          ),
        ),
        Positioned(
          top: -14,
          right: 34,
          child: WashiTape(
            color: AppColors.tapePink,
            angle: 0.16,
            width: 62,
            height: 24,
          ),
        ),
        Positioned.fill(
          child: IgnorePointer(
            child: Stack(
              children: [
                _DecisionStamp(
                  label: 'CONNECT',
                  alignment: Alignment.topLeft,
                  color: AppColors.forestGreen,
                  opacity: connectOpacity,
                  angle: -0.18,
                ),
                _DecisionStamp(
                  label: 'PASS',
                  alignment: Alignment.topRight,
                  color: AppColors.pinkDeep,
                  opacity: passOpacity,
                  angle: 0.18,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ProfilePhoto extends StatelessWidget {
  final PeerProfile profile;

  const _ProfilePhoto({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: -2 * math.pi / 180,
      child: Container(
        width: 112,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.paper,
          border: Border.all(color: AppColors.ink, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink.withValues(alpha: 0.12),
              blurRadius: 10,
              offset: const Offset(2, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: double.infinity,
              height: 82,
              decoration: BoxDecoration(
                color: profile.accentColor.withValues(alpha: 0.35),
                border: Border.all(
                  color: AppColors.ink.withValues(alpha: 0.18),
                  width: 1,
                ),
              ),
              child: Center(
                child: LineIcon(
                  glyph: profile.glyph,
                  size: 46,
                  color: AppColors.ink,
                ),
              ),
            ),
            const SizedBox(height: 7),
            Text(
              profile.initials,
              style: monoLabel(
                fontSize: 12,
                color: AppColors.ink,
                letterSpacing: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DecisionStamp extends StatelessWidget {
  final String label;
  final Alignment alignment;
  final Color color;
  final double opacity;
  final double angle;

  const _DecisionStamp({
    required this.label,
    required this.alignment,
    required this.color,
    required this.opacity,
    required this.angle,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Opacity(
          opacity: opacity,
          child: Transform.rotate(
            angle: angle,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.paperLight.withValues(alpha: 0.86),
                border: Border.all(color: color, width: 2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                label,
                style: monoLabel(fontSize: 15, color: color, letterSpacing: 0),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
