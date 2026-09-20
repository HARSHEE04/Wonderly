
import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/line_icon.dart';
import '../data/models.dart';
import '../services/api_client.dart';
import '../services/vision_client.dart';
import 'learn_found_screen.dart';

class LearnAnalyzingScreen extends StatefulWidget {
  // Optional for now because the existing continuous-scan screen
  // still opens this page without providing an image.
  final Uint8List? imageBytes;

  const LearnAnalyzingScreen({
    super.key,
    this.imageBytes,
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
  bool _isAnalyzing = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();

    _timer = Timer.periodic(
      const Duration(milliseconds: 500),
      (_) {
        if (mounted && _error == null) {
          setState(() {
            _step = (_step + 1) % _steps.length;
          });
        }
      },
    );

    _analyzePhoto();
  }

  Future<void> _analyzePhoto() async {
    if (_isAnalyzing) return;

    final imageBytes = widget.imageBytes;

    if (imageBytes == null || imageBytes.isEmpty) {
      setState(() {
        _error =
            'No photo was provided. Please go back and select a photo.';
      });
      return;
    }

    setState(() {
      _error = null;
      _isAnalyzing = true;
    });

    try {
      // Keep the analyzing animation visible briefly.
      final minimumDisplayTime =
          Future<void>.delayed(const Duration(milliseconds: 1200));

      // STEP 1: Create a real backend session.
      final sessionId = await ApiClient().createSession(
        userId: demoUserId,
        mode: 'learning',
      );

      // STEP 2: Send the real image to Python.
      //
      // Python runs OpenCV, posts SceneAnalysis to the Node.js
      // backend, and returns both the analysis and recommendation.
      final result = await VisionClient().analyzeImage(
        imageBytes: imageBytes,
        sessionId: sessionId,
      );

      await minimumDisplayTime;

      if (!mounted) return;

      // STEP 3: Pass the REAL results to the found screen.
      Navigator.of(context).pushReplacement(
        risePageRoute(
          LearnFoundScreen(
            sessionResult: result.sessionResult,
            sceneJson: result.sceneAnalysis,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;

      // Do not silently replace real results with mock data.
      setState(() {
        _error = 'Could not analyze this photo.\n$error';
      });
    } finally {
      _isAnalyzing = false;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _spin.dispose();
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
                    Text(
                      'analyzing your scene',
                      style: monoLabel(),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _steps[_step],
                      style: sketchDisplay(fontSize: 18),
                    ),
                  ],
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: sketchBody(fontSize: 14),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _isAnalyzing ? null : _analyzePhoto,
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