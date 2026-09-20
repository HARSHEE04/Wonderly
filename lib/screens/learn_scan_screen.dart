
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../theme/app_theme.dart';
import '../data/mock_data.dart';
import '../data/models.dart';
import '../widgets/app_transitions.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/viewfinder_frame.dart';
import 'learn_mode_screen.dart';
import 'learn_analyzing_screen.dart';

class LearnScanScreen extends StatefulWidget {
  final ScanMode mode;

  const LearnScanScreen({
    super.key,
    required this.mode,
  });

  @override
  State<LearnScanScreen> createState() => _LearnScanScreenState();
}

class _LearnScanScreenState extends State<LearnScanScreen> {
  bool _revealed = false;
  bool _pickingPhoto = false;

  /// Select a real photo and pass its bytes to the analyzing screen.
  Future<void> _pickPhoto() async {
    if (_pickingPhoto) return;

    setState(() => _pickingPhoto = true);

    try {
      final photo = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );

      // The user closed the picker without selecting a photo.
      if (photo == null || !mounted) return;

      final imageBytes = await photo.readAsBytes();

      if (!mounted) return;

      Navigator.of(context).pushReplacement(
        risePageRoute(
          LearnAnalyzingScreen(imageBytes: imageBytes),
        ),
      );
    } catch (error) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not select photo: $error'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _pickingPhoto = false);
      }
    }
  }

  @override
  void initState() {
    super.initState();

    // Preserve the existing continuous-scan screen behavior for now.
    // We will connect continuous mode to real camera frames separately.
    if (widget.mode == ScanMode.continuous) {
      Future.delayed(
        const Duration(milliseconds: 1800),
        () {
          if (mounted) {
            setState(() => _revealed = true);
          }
        },
      );

      Future.delayed(
        const Duration(milliseconds: 3000),
        _goToAnalyzing,
      );
    }
  }

  void _goToAnalyzing() {
    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      risePageRoute(
        const LearnAnalyzingScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // These are the existing decorative markers.
    // The real OpenCV results will be displayed on the results screen.
    final markers = mockSceneAnalysis.allSwatches.take(4).toList();

    return Scaffold(
      backgroundColor: AppColors.ink,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 12,
          ),
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
                    widget.mode == ScanMode.photo
                        ? 'take a photo'
                        : 'continuous scan',
                    style: monoLabel(
                      color: AppColors.paperLight.withValues(alpha: 0.7),
                    ),
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
                          colors: [
                            Color(0xFFEDE7D8),
                            Color(0xFFDED6C1),
                          ],
                        ),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Stack(
                        children: [
                          Positioned(
                            top: 30,
                            right: 24,
                            child: LineIcon(
                              glyph: IconGlyph.circle,
                              size: 44,
                              color: AppColors.ink.withValues(alpha: 0.3),
                            ),
                          ),
                          Positioned(
                            bottom: 60,
                            left: 26,
                            child: LineIcon(
                              glyph: IconGlyph.plant,
                              size: 60,
                              color: AppColors.forestGreen.withValues(
                                alpha: 0.5,
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 40,
                            right: 40,
                            child: LineIcon(
                              glyph: IconGlyph.lines,
                              size: 50,
                              color: AppColors.ink.withValues(alpha: 0.3),
                            ),
                          ),
                          if (_revealed ||
                              widget.mode == ScanMode.photo)
                            for (int i = 0; i < markers.length; i++)
                              Positioned(
                                top: 30.0 + (i * 44).toDouble() % 200,
                                left: i.isEven ? 20 : null,
                                right: i.isOdd ? 20 : null,
                                child: AnimatedOpacity(
                                  opacity: _revealed ? 1 : 0,
                                  duration: Duration(
                                    milliseconds: 300 + i * 120,
                                  ),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(
                                        alpha: 0.65,
                                      ),
                                      borderRadius: BorderRadius.circular(18),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: 5,
                                          height: 5,
                                          decoration: BoxDecoration(
                                            color: markers[i].color,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 5),
                                        Text(
                                          markers[i].label.toLowerCase(),
                                          style: monoLabel(
                                            fontSize: 8.5,
                                            color: AppColors.ink,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                        ],
                      ),
                    ),
                    const ViewfinderFrame(color: AppColors.ink),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              if (widget.mode == ScanMode.photo)
                GestureDetector(
                  onTap: _pickingPhoto ? null : _pickPhoto,
                  child: Container(
                    width: 68,
                    height: 68,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.paperLight.withValues(alpha: 0.7),
                        width: 2,
                      ),
                    ),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _pickingPhoto
                            ? AppColors.paperLight.withValues(alpha: 0.5)
                            : AppColors.paperLight,
                      ),
                    ),
                  ),
                )
              else
                Text(
                  _revealed
                      ? 'found a few things — analyzing…'
                      : 'sweeping the room…',
                  style: monoLabel(
                    color: AppColors.paperLight.withValues(alpha: 0.6),
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