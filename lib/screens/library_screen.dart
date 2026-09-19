import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models.dart';
import '../services/api_client.dart';
import '../state/library_store.dart';
import '../widgets/circle_icon_button.dart';
import '../widgets/line_icon.dart';
import '../widgets/paper_texture.dart';
import '../widgets/washi_tape.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  @override
  void initState() {
    super.initState();
    _syncFromBackend();
  }

  /// Pulls artworks actually saved server-side (`GET
  /// /api/users/:userId/artworks`) into the local store. Silently does
  /// nothing if the backend is unreachable — the local/seed entries still
  /// render either way.
  Future<void> _syncFromBackend() async {
    try {
      final artworks = await ApiClient().getArtworks(demoUserId);
      if (!mounted) return;
      setState(() => LibraryStore.instance.mergeRemote(artworks));
    } catch (_) {
      // offline — local entries are still shown
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = LibraryStore.instance.items;
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Stack(
        children: [
          const Positioned.fill(child: PaperTexture()),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                  child: Row(
                    children: [
                      CircleIconButton(
                        icon: Icons.arrow_back_ios_new_rounded,
                        onTap: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('your library', style: sketchDisplay(fontSize: 32)),
                      const SizedBox(height: 6),
                      Text(
                        '${items.length} pages in your creative journey',
                        style: sketchBody(fontSize: 13),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: items.isEmpty
                      ? Center(
                          child: Text('nothing here yet', style: monoLabel()),
                        )
                      : GridView.builder(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                mainAxisSpacing: 16,
                                crossAxisSpacing: 16,
                                childAspectRatio: 0.78,
                              ),
                          itemCount: items.length,
                          itemBuilder: (context, i) => _LibraryCard(
                            entry: items[i],
                            tiltRight: i.isEven,
                          ),
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

class _LibraryCard extends StatelessWidget {
  final LibraryEntry entry;
  final bool tiltRight;
  const _LibraryCard({required this.entry, this.tiltRight = true});

  @override
  Widget build(BuildContext context) {
    final tapeColor = entry.origin == 'Create'
        ? AppColors.coral
        : AppColors.sky;
    final card = Container(
      decoration: BoxDecoration(
        color: AppColors.paperLight,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 1.1,
            child: Container(
              color: entry.photoTint,
              child: Center(
                child: LineIcon(
                  glyph: entry.photoGlyph,
                  size: 44,
                  color: AppColors.ink.withValues(alpha: 0.6),
                ),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    entry.challengeTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: sketchBody(
                      fontSize: 12.5,
                      weight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    entry.conceptTitle != null
                        ? 'from ${entry.conceptTitle}'
                        : entry.origin,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: sketchBody(fontSize: 10),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: AppColors.ink.withValues(alpha: 0.16),
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          entry.origin.toLowerCase(),
                          style: monoLabel(fontSize: 7.5),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        _formatDate(entry.date),
                        style: monoLabel(fontSize: 7.5),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          card,
          Positioned(
            top: -10,
            left: tiltRight ? 14 : null,
            right: tiltRight ? null : 14,
            child: WashiTape(
              color: tapeColor,
              angle: tiltRight ? -0.18 : 0.18,
              width: 15,
              height: 32,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime d) {
    final diff = DateTime.now().difference(d).inDays;
    if (diff == 0) return 'today';
    if (diff == 1) return '1d ago';
    return '${diff}d ago';
  }
}
