import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../theme/app_theme.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../widgets/viewfinder_frame.dart';
import 'capture_preview_screen.dart';

/// Lets the artist upload a real photo of their finished, physical artwork
/// so it can be saved into the Library (used by both Learn and Create).
class CaptureScreen extends StatefulWidget {
  final CreativeChallenge challenge;
  final String origin;
  final String? conceptTitle;
  final String? sessionId;

  const CaptureScreen({
    super.key,
    required this.challenge,
    required this.origin,
    this.conceptTitle,
    this.sessionId,
  });

  @override
  State<CaptureScreen> createState() => _CaptureScreenState();
}

class _CaptureScreenState extends State<CaptureScreen> {
  bool _picking = false;
  String? _error;

  Future<void> _uploadPhoto() async {
    setState(() {
      _picking = true;
      _error = null;
    });
    try {
      final photo = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
      );
      if (photo == null) return;
      final bytes = await photo.readAsBytes();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        risePageRoute(
          CapturePreviewScreen(
            challenge: widget.challenge,
            origin: widget.origin,
            conceptTitle: widget.conceptTitle,
            sessionId: widget.sessionId,
            imageBytes: bytes,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = 'Could not upload photo: $error');
    } finally {
      if (mounted) setState(() => _picking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
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
                      Text(
                        'upload your artwork',
                        style: monoLabel(color: AppColors.inkSoft),
                      ),
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
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                LineIcon(
                                  glyph: IconGlyph.spark,
                                  size: 72,
                                  color: AppColors.paperLight.withValues(
                                    alpha: 0.55,
                                  ),
                                ),
                                if (_error != null) ...[
                                  const SizedBox(height: 16),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 24,
                                    ),
                                    child: Text(
                                      _error!,
                                      textAlign: TextAlign.center,
                                      style: monoLabel(
                                        color: AppColors.paperLight,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                        const ViewfinderFrame(),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  AtelierButton(
                    label: _picking ? 'uploading…' : 'upload a photo',
                    fill: AppColors.ink,
                    onTap: _picking ? null : _uploadPhoto,
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
