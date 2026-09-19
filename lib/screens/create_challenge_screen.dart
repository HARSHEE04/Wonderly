import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../services/api_client.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/challenge_tags.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/paper_texture.dart';
import 'create_reminder_screen.dart';

class CreateChallengeScreen extends StatelessWidget {
  const CreateChallengeScreen({super.key});

  /// Starts a real 'creative' session and asks the backend to recommend a
  /// challenge for the (still mocked) scene, merging its verdict into the
  /// locally-authored copy. Falls back to the plain mock challenge, with no
  /// session id, if the backend is unreachable.
  Future<void> _startChallenge(BuildContext context, CreativeChallenge challenge) async {
    String? sessionId;
    CreativeChallenge finalChallenge = challenge;
    try {
      final id = await ApiClient().createSession(userId: demoUserId, mode: 'creative');
      final decision = await ApiClient().recommendChallenge(
        scene: mockSceneAnalysis.toApiJson(),
        userId: demoUserId,
      );
      sessionId = id;
      finalChallenge = challenge.mergeDecision(decision);
    } catch (_) {
      // backend unavailable — proceed with the local mock challenge
    }
    if (!context.mounted) return;
    Navigator.of(context).push(risePageRoute(CreateReminderScreen(challenge: finalChallenge, sessionId: sessionId)));
  }

  @override
  Widget build(BuildContext context) {
    final challenge = mockDailyChallenge;
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
                  Text('create · daily challenge', style: monoLabel()),
                  const SizedBox(height: 10),
                  Text(challenge.title, style: editorialDisplay(fontSize: 30)),
                  const SizedBox(height: 14),
                  Text(challenge.instructions, style: sketchBody(fontSize: 14.5)),
                  const SizedBox(height: 16),
                  ChallengeTags(challenge: challenge),
                  const Spacer(),
                  Text(
                    'there are no wrong answers here',
                    style: sketchDisplay(fontSize: 18, color: AppColors.pinkDeep),
                  ),
                  const SizedBox(height: 16),
                  AtelierButton(
                    label: 'start challenge',
                    fill: AppColors.ink,
                    onTap: () => _startChallenge(context, challenge),
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
