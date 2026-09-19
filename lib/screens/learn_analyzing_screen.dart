import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/line_icon.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../services/api_client.dart';
import 'learn_found_screen.dart';

class LearnAnalyzingScreen extends StatefulWidget {
  const LearnAnalyzingScreen({super.key});

  @override
  State<LearnAnalyzingScreen> createState() => _LearnAnalyzingScreenState();
}

class _LearnAnalyzingScreenState extends State<LearnAnalyzingScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _spin = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  final List<String> _steps = const ['reading colors', 'tracing shapes', 'noticing patterns', 'finding concepts'];
  int _step = 0;
  Timer? _timer;
  late final Future<LearnSessionResult?> _sessionFuture;

  @override
  void initState() {
    super.initState();
    _sessionFuture = _startBackendSession();
    _timer = Timer.periodic(const Duration(milliseconds: 500), (t) {
      if (!mounted) return;
      setState(() => _step = (_step + 1) % _steps.length);
    });
    Future.delayed(const Duration(milliseconds: 2200), () async {
      if (!mounted) return;
      final result = await _sessionFuture;
      if (!mounted) return;
      Navigator.of(context).pushReplacement(risePageRoute(LearnFoundScreen(sessionResult: result)));
    });
  }

  /// Creates a real backend session and posts the (still mocked) scene
  /// analysis to get a real `ChallengeDecision` back. Falls back to null on
  /// any failure (backend offline) so the Learn flow still works locally.
  Future<LearnSessionResult?> _startBackendSession() async {
    try {
      final sessionId = await ApiClient().createSession(userId: demoUserId, mode: 'learning');
      final decision = await ApiClient().postSceneAnalysis(
        sessionId: sessionId,
        scene: mockSceneAnalysis.toApiJson(),
      );
      return LearnSessionResult(sessionId: sessionId, decision: decision);
    } catch (_) {
      return null;
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RotationTransition(
              turns: _spin,
              child: LineIcon(glyph: IconGlyph.spark, size: 46, color: AppColors.sky),
            ),
            const SizedBox(height: 20),
            Text('analyzing your scene', style: monoLabel()),
            const SizedBox(height: 8),
            Text(_steps[_step], style: sketchDisplay(fontSize: 18)),
          ],
        ),
      ),
    );
  }
}
