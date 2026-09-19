import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/challenge_tags.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/highlight_marker.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../widgets/sticky_note.dart';
import 'create_reminder_screen.dart';

class CreateChallengeScreen extends StatelessWidget {
  /// The scan-based challenge to show, already resolved by
  /// [LearnAnalyzingScreen] (origin 'Create') before navigating here. Falls
  /// back to the local mock challenge if this screen is ever opened without
  /// scanning first.
  final CreativeChallenge? challenge;
  final String? sessionId;

  const CreateChallengeScreen({super.key, this.challenge, this.sessionId});

  @override
  Widget build(BuildContext context) {
    final resolvedChallenge = challenge ?? mockDailyChallenge;
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 26),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  CircleIconButton(
                    icon: Icons.arrow_back_ios_new_rounded,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(height: 26),
                  StickyNote(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('create · daily challenge', style: monoLabel()),
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const LineIcon(glyph: IconGlyph.compass, size: 30),
                            const SizedBox(width: 10),
                            Expanded(
                              child: HighlightMarker(
                                child: Text(
                                  resolvedChallenge.title,
                                  style: editorialDisplay(fontSize: 30),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          resolvedChallenge.instructions,
                          style: sketchBody(fontSize: 16.5),
                        ),
                        const SizedBox(height: 16),
                        ChallengeTags(challenge: resolvedChallenge),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                  Text(
                    'there are no wrong answers here',
                    style: sketchDisplay(
                      fontSize: 20,
                      color: AppColors.pinkDeep,
                    ),
                  ),
                  const SizedBox(height: 16),
                  AtelierButton(
                    label: 'start challenge',
                    fill: AppColors.ink,
                    onTap: () => Navigator.of(context).push(
                      risePageRoute(
                        CreateReminderScreen(
                          challenge: resolvedChallenge,
                          sessionId: sessionId,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
