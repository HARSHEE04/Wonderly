import 'package:flutter/material.dart';

import '../data/models.dart';
import '../theme/app_theme.dart';

/// The two small tags shown on a challenge screen — mirrors the two fields
/// the backend's `ChallengeDecision` actually carries (`difficulty` as a
/// number, `challengeType` as one of the fixed backend types) rather than an
/// invented easy/medium/hard label.
class ChallengeTags extends StatelessWidget {
  final CreativeChallenge challenge;
  const ChallengeTags({super.key, required this.challenge});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        _Tag('difficulty ${challenge.difficulty}/5'),
        _Tag('type · ${challenge.challengeType}'),
      ],
    );
  }
}

class _Tag extends StatelessWidget {
  final String label;
  const _Tag(this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.ink.withValues(alpha: 0.16)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: monoLabel(fontSize: 12)),
    );
  }
}
