import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/challenge_tags.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/paper_texture.dart';
import '../services/api_client.dart';
import 'create_reminder_screen.dart';

class LearnChallengeScreen extends StatefulWidget {
  final LearningElement element;
  final LearnSessionResult? sessionResult;
  const LearnChallengeScreen({
    super.key,
    required this.element,
    this.sessionResult,
  });

  @override
  State<LearnChallengeScreen> createState() => _LearnChallengeScreenState();
}

class _LearnChallengeScreenState extends State<LearnChallengeScreen> {
  bool _loading = false;
  CreativeChallenge? _challenge;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadChallenge();
  }

  Future<void> _loadChallenge() async {
    final result = widget.sessionResult;
    if (_loading || result == null) {
      if (result == null)
        setState(
          () => _error =
              'Could not load this practice challenge. Scan again to retry.',
        );
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final element = widget.element;
      final saved = await ApiClient().generateCreativeChallenge(
        result.sessionId,
        learningContext: {
          'focusConcept': element.name,
          'learningInsight':
              '${element.description} ${element.artisticUse} ${element.effect}',
          'learningEvidence': [
            element.howToUse,
            element.activity,
            result.learningContent.summary,
          ],
        },
      );
      if (!mounted) return;
      setState(() => _challenge = CreativeChallenge.fromInstance(saved));
    } catch (_) {
      if (mounted)
        setState(
          () => _error =
              'Could not load this practice challenge. Please try again.',
        );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final challenge = _challenge;
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
                  const SizedBox(height: 22),
                  Text(
                    'based on ${widget.element.name.toLowerCase()}',
                    style: monoLabel(color: AppColors.violet),
                  ),
                  const SizedBox(height: 10),
                  if (_loading)
                    const SizedBox(
                      height: 220,
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (_error != null)
                    Text(_error!, style: sketchBody(fontSize: 16.5))
                  else if (challenge != null) ...[
                    Text(
                      challenge.title,
                      style: editorialDisplay(fontSize: 30),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      challenge.instructions,
                      style: sketchBody(fontSize: 16.5),
                    ),
                    const SizedBox(height: 16),
                    ChallengeTags(challenge: challenge),
                  ],
                  const SizedBox(height: 40),
                  if (_error != null)
                    AtelierButton(
                      label: 'retry',
                      fill: AppColors.ink,
                      onTap: _loadChallenge,
                    )
                  else if (!_loading && challenge != null)
                    AtelierButton(
                      label: 'start challenge',
                      fill: AppColors.ink,
                      onTap: () => Navigator.of(context).push(
                        risePageRoute(
                          CreateReminderScreen(
                            challenge: challenge,
                            origin: 'Learn',
                            conceptTitle: widget.element.name,
                            sessionId: widget.sessionResult?.sessionId,
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
