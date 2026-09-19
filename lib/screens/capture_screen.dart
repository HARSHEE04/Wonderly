import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/viewfinder_frame.dart';
import 'capture_preview_screen.dart';

/// Mock camera used to photograph the physical, finished artwork. Real
/// device-camera integration is out of scope for this wireframe — tapping
/// the shutter simulates a capture.
class CaptureScreen extends StatelessWidget {
  final CreativeChallenge challenge;
  final String origin;
  final String? conceptTitle;

  const CaptureScreen({super.key, required this.challenge, required this.origin, this.conceptTitle});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ink,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          child: Column(
            children: [
              Row(
                children: [
                  CircleIconButton(
                    icon: Icons.close_rounded,
                    onTap: () => Navigator.of(context).pop(),
                    filled: false,
                  ),
                  const Spacer(),
                  Text('photograph your artwork', style: monoLabel(color: AppColors.paperLight.withValues(alpha: 0.7))),
                  const Spacer(),
                  const SizedBox(width: 38),
                ],
              ),
              const SizedBox(height: 14),
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF2A2C52), Color(0xFF1B1D3D)],
                        ),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Center(
                        child: LineIcon(glyph: IconGlyph.spark, size: 90, color: AppColors.paperLight.withValues(alpha: 0.55)),
                      ),
                    ),
                    const ViewfinderFrame(),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              GestureDetector(
                onTap: () => Navigator.of(context).pushReplacement(risePageRoute(CapturePreviewScreen(
                  challenge: challenge,
                  origin: origin,
                  conceptTitle: conceptTitle,
                ))),
                child: Container(
                  width: 68,
                  height: 68,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.paperLight.withValues(alpha: 0.7), width: 2),
                  ),
                  child: const DecoratedBox(decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.paperLight)),
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }
}
