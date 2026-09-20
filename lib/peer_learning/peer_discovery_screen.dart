import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_theme.dart';
import '../widgets/atelier_button.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/paper_texture.dart';
import '../widgets/sticky_note.dart';
import 'data/mock_peers.dart';
import 'models/peer_profile.dart';
import 'widgets/match_dialog.dart';
import 'widgets/peer_card.dart';

enum _SwipeChoice { pass, connect }

class PeerDiscoveryScreen extends StatefulWidget {
  const PeerDiscoveryScreen({super.key});

  @override
  State<PeerDiscoveryScreen> createState() => _PeerDiscoveryScreenState();
}

class _PeerDiscoveryScreenState extends State<PeerDiscoveryScreen> {
  static const _swipeThreshold = 96.0;

  int _currentIndex = 0;
  Offset _dragOffset = Offset.zero;
  bool _dragging = false;
  bool _choiceInProgress = false;
  String? _statusMessage;

  PeerProfile? get _currentProfile => _currentIndex < mockPeerProfiles.length
      ? mockPeerProfiles[_currentIndex]
      : null;

  void _resetDeck() {
    HapticFeedback.selectionClick();
    setState(() {
      _currentIndex = 0;
      _dragOffset = Offset.zero;
      _choiceInProgress = false;
      _statusMessage = 'Back to the first artist card.';
    });
  }

  void _onDragUpdate(DragUpdateDetails details) {
    if (_choiceInProgress) return;
    setState(() {
      _dragging = true;
      _dragOffset += Offset(details.delta.dx, details.delta.dy * 0.2);
    });
  }

  void _onDragEnd(DragEndDetails details) {
    if (_choiceInProgress) return;
    final projected = _dragOffset.dx + details.velocity.pixelsPerSecond.dx / 8;
    if (projected > _swipeThreshold) {
      _animateChoice(_SwipeChoice.connect);
    } else if (projected < -_swipeThreshold) {
      _animateChoice(_SwipeChoice.pass);
    } else {
      setState(() {
        _dragging = false;
        _dragOffset = Offset.zero;
      });
    }
  }

  void _animateChoice(_SwipeChoice choice) {
    if (_choiceInProgress) return;
    final profile = _currentProfile;
    if (profile == null) return;

    final screenWidth = MediaQuery.of(context).size.width;
    final direction = choice == _SwipeChoice.connect ? 1.0 : -1.0;
    HapticFeedback.selectionClick();

    setState(() {
      _dragging = false;
      _choiceInProgress = true;
      _dragOffset = Offset(direction * (screenWidth + 160), _dragOffset.dy);
    });

    Future<void>.delayed(const Duration(milliseconds: 230), () {
      if (!mounted) return;

      final mutual = profile.isMutualWith(demoLearner);
      setState(() {
        _currentIndex += 1;
        _dragOffset = Offset.zero;
        _choiceInProgress = false;
        _statusMessage = switch (choice) {
          _SwipeChoice.pass => 'Passed on ${profile.name}.',
          _SwipeChoice.connect when mutual =>
            'Saved a mutual match with ${profile.name}.',
          _SwipeChoice.connect => 'Saved ${profile.name} for later.',
        };
      });

      if (choice == _SwipeChoice.connect && mutual) {
        showDialog<void>(
          context: context,
          builder: (_) => MatchDialog(profile: profile, learner: demoLearner),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final profile = _currentProfile;
    final dragProgress = (_dragOffset.dx / _swipeThreshold).clamp(-1.0, 1.0);

    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                  child: Row(
                    children: [
                      CircleIconButton(
                        icon: Icons.arrow_back_rounded,
                        onTap: () => Navigator.of(context).pop(),
                        filled: false,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'peer sketchbook',
                              style: sketchDisplay(
                                fontSize: 32,
                                color: AppColors.ink,
                              ),
                            ),
                            Text(
                              'swipe through learning trades',
                              style: monoLabel(
                                fontSize: 11,
                                color: AppColors.inkSoft,
                                letterSpacing: 0,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _LearnerSummary(learner: demoLearner),
                ),
                const SizedBox(height: 14),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 220),
                      child: profile == null
                          ? _EmptyDeck(onReset: _resetDeck)
                          : _SwipeDeck(
                              key: ValueKey(profile.id),
                              profile: profile,
                              dragOffset: _dragOffset,
                              dragProgress: dragProgress,
                              dragging: _dragging,
                              onDragUpdate: _onDragUpdate,
                              onDragEnd: _onDragEnd,
                            ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 22),
                  child: Column(
                    children: [
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 180),
                        child: _statusMessage == null
                            ? const _SwipeHint()
                            : _StatusNote(
                                key: ValueKey(_statusMessage),
                                message: _statusMessage!,
                              ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: AtelierButton(
                              label: 'pass',
                              onTap: profile == null || _choiceInProgress
                                  ? null
                                  : () => _animateChoice(_SwipeChoice.pass),
                              outlined: true,
                              outlineColor: AppColors.ink,
                              outlineTextColor: AppColors.ink,
                              tapeColor: AppColors.tapeBlue,
                              tapeOnLeft: true,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: AtelierButton(
                              label: 'connect',
                              onTap: profile == null || _choiceInProgress
                                  ? null
                                  : () => _animateChoice(_SwipeChoice.connect),
                              fill: AppColors.yellow,
                              textColor: AppColors.ink,
                              tapeColor: AppColors.tapePink,
                              tapeOnLeft: false,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SwipeDeck extends StatelessWidget {
  final PeerProfile profile;
  final Offset dragOffset;
  final double dragProgress;
  final bool dragging;
  final GestureDragUpdateCallback onDragUpdate;
  final GestureDragEndCallback onDragEnd;

  const _SwipeDeck({
    super.key,
    required this.profile,
    required this.dragOffset,
    required this.dragProgress,
    required this.dragging,
    required this.onDragUpdate,
    required this.onDragEnd,
  });

  @override
  Widget build(BuildContext context) {
    final angle = (dragOffset.dx / 520).clamp(-0.18, 0.18);

    return LayoutBuilder(
      builder: (context, constraints) {
        final cardHeight = math.min(constraints.maxHeight, 610.0);
        return Center(
          child: SizedBox(
            height: cardHeight,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Transform.rotate(
                  angle: -0.025,
                  child: Container(
                    width: math.min(constraints.maxWidth - 24, 430),
                    height: cardHeight - 18,
                    decoration: BoxDecoration(
                      color: AppColors.paperShadow.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: AppColors.ink.withValues(alpha: 0.08),
                        width: 1,
                      ),
                    ),
                  ),
                ),
                GestureDetector(
                  onHorizontalDragUpdate: onDragUpdate,
                  onHorizontalDragEnd: onDragEnd,
                  child: AnimatedContainer(
                    duration: dragging
                        ? Duration.zero
                        : const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    transformAlignment: Alignment.center,
                    transform: Matrix4.identity()
                      ..translateByDouble(dragOffset.dx, dragOffset.dy, 0, 1)
                      ..rotateZ(angle),
                    width: math.min(constraints.maxWidth, 440),
                    height: cardHeight,
                    child: PeerCard(
                      profile: profile,
                      learner: demoLearner,
                      dragProgress: dragProgress,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _LearnerSummary extends StatelessWidget {
  final DemoLearner learner;

  const _LearnerSummary({required this.learner});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.paperLight.withValues(alpha: 0.78),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.ink.withValues(alpha: 0.12),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: _SummaryColumn(
              title: 'YOU TEACH',
              skills: learner.canTeach,
              color: AppColors.yellow,
            ),
          ),
          Container(
            width: 1,
            height: 46,
            margin: const EdgeInsets.symmetric(horizontal: 12),
            color: AppColors.ink.withValues(alpha: 0.12),
          ),
          Expanded(
            child: _SummaryColumn(
              title: 'YOU WANT',
              skills: learner.wantsToLearn,
              color: AppColors.sky,
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryColumn extends StatelessWidget {
  final String title;
  final List<String> skills;
  final Color color;

  const _SummaryColumn({
    required this.title,
    required this.skills,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: monoLabel(
            fontSize: 10,
            color: AppColors.inkSoft,
            letterSpacing: 0,
          ),
        ),
        const SizedBox(height: 7),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            for (final skill in skills)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.45),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  skill,
                  style: sketchBody(
                    fontSize: 12,
                    weight: FontWeight.w800,
                    color: AppColors.ink,
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _SwipeHint extends StatelessWidget {
  const _SwipeHint();

  @override
  Widget build(BuildContext context) {
    return Text(
      'Swipe left to pass. Swipe right to connect.',
      textAlign: TextAlign.center,
      style: sketchBody(
        fontSize: 14,
        weight: FontWeight.w600,
        color: AppColors.inkSoft,
      ),
    );
  }
}

class _StatusNote extends StatelessWidget {
  final String message;

  const _StatusNote({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Text(
      message,
      textAlign: TextAlign.center,
      style: sketchBody(
        fontSize: 14,
        weight: FontWeight.w800,
        color: AppColors.ink,
      ),
    );
  }
}

class _EmptyDeck extends StatelessWidget {
  final VoidCallback onReset;

  const _EmptyDeck({required this.onReset});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 360),
        child: StickyNote(
          angle: -0.01,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'All artist cards reviewed.',
                textAlign: TextAlign.center,
                style: sketchDisplay(fontSize: 30, color: AppColors.ink),
              ),
              const SizedBox(height: 10),
              Text(
                'For the prototype, the stack loops through five mock peers.',
                textAlign: TextAlign.center,
                style: sketchBody(fontSize: 15, color: AppColors.inkSoft),
              ),
              const SizedBox(height: 18),
              AtelierButton(
                label: 'review stack',
                onTap: onReset,
                fill: AppColors.ink,
                textColor: AppColors.paperLight,
                tapeColor: AppColors.tapeGreen,
                fontSize: 14,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
