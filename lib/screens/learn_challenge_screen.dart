import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/challenge_tags.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/paper_texture.dart';
import '../services/api_client.dart';
import 'create_reminder_screen.dart';

class LearnChallengeScreen extends StatelessWidget {
  final ArtConcept concept;
  final LearnSessionResult? sessionResult;
  const LearnChallengeScreen({super.key, required this.concept, this.sessionResult});

  @override
  Widget build(BuildContext context) {
    final challenge = challengeForConcept(concept).mergeDecision(sessionResult?.decision);
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 26),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  CircleIconButton(icon: Icons.arrow_back_ios_new_rounded, onTap: () => Navigator.of(context).pop()),
                  const SizedBox(height: 22),
                  Text('based on ${concept.title.toLowerCase()}', style: monoLabel(color: concept.accent)),
                  const SizedBox(height: 10),
                  Text(challenge.title, style: editorialDisplay(fontSize: 28)),
                  const SizedBox(height: 14),
                  Text(challenge.instructions, style: sketchBody(fontSize: 14.5)),
                  const SizedBox(height: 16),
                  ChallengeTags(challenge: challenge),
                  const Spacer(),
                  AtelierButton(
                    label: 'start challenge',
                    fill: AppColors.ink,
                    onTap: () async {
                      String? sessionId = sessionResult?.sessionId;
                      if (sessionId != null) {
                        try {
                          await ApiClient().createChallengeInstance(
                            sessionId: sessionId,
                            title: challenge.title,
                            instructions: challenge.instructions,
                          );
                        } catch (_) {
                          sessionId = null;
                        }
                      }
                      if (!context.mounted) return;
                      Navigator.of(context).push(risePageRoute(CreateReminderScreen(
                        challenge: challenge,
                        origin: 'Learn',
                        conceptTitle: concept.title,
                        sessionId: sessionId,
                      )));
                    },
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
