import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/line_icon.dart';
import '../data/models.dart';
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

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 500), (t) {
      if (!mounted) return;
      setState(() => _step = (_step + 1) % _steps.length);
    });
    Future.delayed(const Duration(milliseconds: 2200), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(risePageRoute(const LearnFoundScreen()));
    });
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
