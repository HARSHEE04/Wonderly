import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/models.dart';
import '../services/api_client.dart';
import '../state/library_store.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import 'saved_screen.dart';

class CapturePreviewScreen extends StatelessWidget {
  final CreativeChallenge challenge;
  final String origin;
  final String? conceptTitle;
  final String? sessionId;

  const CapturePreviewScreen({
    super.key,
    required this.challenge,
    required this.origin,
    this.conceptTitle,
    this.sessionId,
  });

  @override
  Widget build(BuildContext context) {
    final tint = origin == 'Create' ? const Color(0xFFFBEFD2) : const Color(0xFFDCEBF5);
    final glyph = origin == 'Create' ? IconGlyph.spark : IconGlyph.symmetry;

    return Scaffold(
      backgroundColor: AppColors.ink,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          child: Column(
            children: [
              Row(
                children: [
                  CircleIconButton(icon: Icons.close_rounded, onTap: () => Navigator.of(context).pop(), filled: false),
                  const Spacer(),
                  Text('preview', style: monoLabel(color: AppColors.paperLight.withValues(alpha: 0.7))),
                  const Spacer(),
                  const SizedBox(width: 38),
                ],
              ),
              const SizedBox(height: 18),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(color: tint, borderRadius: BorderRadius.circular(18)),
                  child: Center(child: LineIcon(glyph: glyph, size: 100, color: AppColors.ink.withValues(alpha: 0.7))),
                ),
              ),
              const SizedBox(height: 16),
              Text(challenge.title, style: editorialDisplay(fontSize: 18, color: AppColors.paperLight)),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: AtelierButton(
                      label: 'retake',
                      outlined: true,
                      outlineColor: AppColors.paperLight,
                      outlineTextColor: AppColors.paperLight,
                      onTap: () => Navigator.of(context).pop(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AtelierButton(
                      label: 'save',
                      fill: AppColors.yellow,
                      textColor: AppColors.ink,
                      onTap: () {
                        LibraryStore.instance.add(LibraryEntry(
                          id: DateTime.now().microsecondsSinceEpoch.toString(),
                          challengeTitle: challenge.title,
                          origin: origin,
                          conceptTitle: conceptTitle,
                          photoTint: tint,
                          photoGlyph: glyph,
                          date: DateTime.now(),
                        ));
                        // Fire-and-forget: this is a real session, so mark it
                        // complete and persist the artwork server-side. Never
                        // blocks the local save — the wireframe must keep
                        // working with the backend offline.
                        final id = sessionId;
                        if (id != null) {
                          unawaited(ApiClient().completeSession(
                            sessionId: id,
                            userId: demoUserId,
                            challengeType: challenge.challengeType,
                            metadata: {
                              'title': challenge.title,
                              'origin': origin,
                              if (conceptTitle != null) 'conceptTitle': conceptTitle,
                            },
                          ).catchError((_) {}));
                        }
                        Navigator.of(context).pushReplacement(risePageRoute(const SavedScreen()));
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
