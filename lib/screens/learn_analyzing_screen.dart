import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/line_icon.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../services/api_client.dart';
import '../services/vision_client.dart';
import 'create_challenge_screen.dart';
import 'learn_found_screen.dart';

class LearnAnalyzingScreen extends StatefulWidget {
  final Uint8List imageBytes;
  /// 'Learn' goes to the learning results; 'Create' generates a challenge.
  final String origin;

  const LearnAnalyzingScreen({
    super.key,
    required this.imageBytes,
    this.origin = 'Learn',
  });

  @override
  State<LearnAnalyzingScreen> createState() =>
      _LearnAnalyzingScreenState();
}

class _LearnAnalyzingScreenState extends State<LearnAnalyzingScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _spin = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 2),
  )..repeat();
  final List<String> _steps = const [
    'reading colors',
    'tracing shapes',
    'noticing patterns',
    'finding concepts',
  ];
  int _step = 0;
  String? _error;
  bool _busy = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 500), (_) {
      if (!mounted || _error != null) return;
      setState(() => _step = (_step + 1) % _steps.length);
    });
    _startFlow();
  }

  Future<void> _startFlow() async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      if (widget.imageBytes.isEmpty) {
        throw ApiException('No image was captured. Please try again.');
      }
      final minimumDisplay = Future<void>.delayed(
        const Duration(milliseconds: 1200),
      );
      // Create only one backend session. Python posts the real scene once.
      final sessionId = await ApiClient().createSession(
        userId: demoUserId,
        mode: widget.origin == 'Create' ? 'creative' : 'learning',
      );
      final vision = await VisionClient().analyzeImage(
        imageBytes: widget.imageBytes,
        sessionId: sessionId,
      );
      // Use teammate's current scene model for the tiles in both flows.
      currentSceneAnalysis = SceneAnalysis.fromCvJson(
        vision.sceneAnalysis,
        concepts: const <ArtConcept>[],
      );
      // Generate the teammate's new learning content from this real session.
      final learningContent = await ApiClient().generateLearningContent(
        sessionId,
      );
      final result = LearnSessionResult(
        sessionId: sessionId,
        decision: vision.decision,
        learningContent: learningContent,
      );
      await minimumDisplay;
      if (!mounted) return;
      if (widget.origin == 'Create') {
        Navigator.of(context).pushReplacement(
          risePageRoute(CreateChallengeScreen(sessionId: result.sessionId)),
        );
      } else {
        Navigator.of(context).pushReplacement(
          risePageRoute(LearnFoundScreen(sessionResult: result)),
        );
      }
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = 'Could not analyze this photo.\n$error');
    } finally {
      _busy = false;
    }
  }

  @override
  void dispose() {
    _spin.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _error == null
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    RotationTransition(
                      turns: _spin,
                      child: LineIcon(
                        glyph: IconGlyph.spark,
                        size: 46,
                        color: AppColors.sky,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text('analyzing your scene', style: monoLabel()),
                    const SizedBox(height: 8),
                    Text(_steps[_step], style: sketchDisplay(fontSize: 20)),
                  ],
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: sketchBody(fontSize: 15),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _busy ? null : _startFlow,
                      child: const Text('Try again'),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Go back'),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
