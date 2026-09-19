import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import 'capture_screen.dart';

class CreateReminderScreen extends StatelessWidget {
  final CreativeChallenge challenge;
  final String origin;
  final String? conceptTitle;
  final String? sessionId;
  const CreateReminderScreen({
    super.key,
    required this.challenge,
    this.origin = 'Create',
    this.conceptTitle,
    this.sessionId,
  });

  @override
  Widget build(BuildContext context) {
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
                  const Spacer(),
                  Center(child: LineIcon(glyph: IconGlyph.spark, size: 48, color: AppColors.pinkDeep)),
                  const SizedBox(height: 22),
                  Center(child: Text('creation reminder', style: monoLabel())),
                  const SizedBox(height: 10),
                  Text(
                    'Step away from the screen.',
                    textAlign: TextAlign.center,
                    style: editorialDisplay(fontSize: 24),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Create outside the app — paper, iPad, Procreate, whatever feels right. Come back when you\'re holding something finished.',
                    textAlign: TextAlign.center,
                    style: sketchBody(fontSize: 14),
                  ),
                  const Spacer(),
                  AtelierButton(
                    label: "i'm done",
                    fill: AppColors.ink,
                    onTap: () => Navigator.of(context).push(risePageRoute(CaptureScreen(
                      challenge: challenge,
                      origin: origin,
                      conceptTitle: conceptTitle,
                      sessionId: sessionId,
                    ))),
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
