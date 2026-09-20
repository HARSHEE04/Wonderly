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

class CreateChallengeScreen extends StatefulWidget {
  const CreateChallengeScreen({super.key});

  @override
  State<CreateChallengeScreen> createState() => _CreateChallengeScreenState();
}

class _CreateChallengeScreenState extends State<CreateChallengeScreen> {
  String? _sessionId;
  bool _sceneAttached = false;
  bool _loading = false;
  CreativeChallenge? _challenge;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadChallenge();
  }

  Future<void> _loadChallenge() async {
    if (_loading) return;
    setState(() { _loading = true; _error = null; });
    try {
      final api = ApiClient();
      _sessionId ??= await api.createSession(userId: demoUserId, mode: 'creative');
      if (!_sceneAttached) {
        final decision = await api.postSceneAnalysis(sessionId: _sessionId!, scene: mockSceneAnalysis.toApiJson());
        if (decision == null) throw ApiException('No challenge available for this scene');
        _sceneAttached = true;
      }
      final saved = await api.generateCreativeChallenge(_sessionId!);
      if (!mounted) return;
      setState(() { _challenge = CreativeChallenge.fromInstance(saved); });
    } catch (_) {
      if (mounted) setState(() { _error = 'Could not load your challenge. Please try again.'; });
    } finally {
      if (mounted) setState(() { _loading = false; });
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
                  if (_loading) const Expanded(child: Center(child: CircularProgressIndicator()))
                  else if (_error != null) Expanded(child: Center(child: Text(_error!, style: sketchBody(fontSize: 14.5))))
                  else if (challenge != null) Expanded(
                    child: SingleChildScrollView(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(challenge.title, style: editorialDisplay(fontSize: 30)),
                        const SizedBox(height: 14),
                        Text(challenge.instructions, style: sketchBody(fontSize: 14.5)),
                        const SizedBox(height: 16),
                        ChallengeTags(challenge: challenge),
                      ]),
                    ),
                  ),
                  Text(
                    'there are no wrong answers here',
                    style: sketchDisplay(fontSize: 18, color: AppColors.pinkDeep),
                  ),
                  const SizedBox(height: 16),
                  if (_error != null) AtelierButton(label: 'retry', fill: AppColors.ink, onTap: _loadChallenge)
                  else if (!_loading && challenge != null) AtelierButton(
                    label: 'start challenge',
                    fill: AppColors.ink,
                    onTap: () => Navigator.of(context).push(risePageRoute(CreateReminderScreen(challenge: challenge, sessionId: _sessionId))),
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
