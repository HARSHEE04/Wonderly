import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/line_icon.dart';
import '../data/models.dart';
import 'library_screen.dart';

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              LineIcon(glyph: IconGlyph.spark, size: 56, color: AppColors.pinkDeep),
              const SizedBox(height: 22),
              Text('saved to your library', style: monoLabel()),
              const SizedBox(height: 10),
              Text('Another page in your journey.', style: editorialDisplay(fontSize: 24), textAlign: TextAlign.center),
              const SizedBox(height: 36),
              AtelierButton(
                label: 'view library',
                fill: AppColors.ink,
                onTap: () => Navigator.of(context).pushAndRemoveUntil(
                  risePageRoute(const LibraryScreen()),
                  (route) => route.isFirst,
                ),
              ),
              const SizedBox(height: 12),
              AtelierButton(
                label: 'back to home',
                outlined: true,
                onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
