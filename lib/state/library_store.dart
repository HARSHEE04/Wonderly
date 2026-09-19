import '../data/mock_data.dart';
import '../data/models.dart';
import '../theme/app_theme.dart';

/// In-memory mock store for saved Library entries. Local saves are instant
/// (see [add]); [mergeRemote] additionally folds in artworks the backend
/// actually persisted (`GET /api/users/:userId/artworks`), so the Library
/// reflects real saved sessions once the backend is reachable.
class LibraryStore {
  LibraryStore._();
  static final LibraryStore instance = LibraryStore._();

  final List<LibraryEntry> _items = buildSeedLibrary();

  List<LibraryEntry> get items => List.unmodifiable(_items);

  void add(LibraryEntry entry) => _items.insert(0, entry);

  /// Merges backend `Artwork` records (as returned by `GET
  /// /api/users/:userId/artworks`) into the list, skipping ones already
  /// merged in a previous sync. Artworks are only created with metadata when
  /// saved via [ApiClient.completeSession], so `metadata` carries the
  /// title/origin/concept this wireframe needs to render a card.
  void mergeRemote(List<Map<String, dynamic>> artworks) {
    for (final artwork in artworks) {
      final remoteId = artwork['id']?.toString();
      if (remoteId == null || _items.any((e) => e.remoteId == remoteId))
        continue;

      final metadata =
          (artwork['metadata'] as Map?)?.cast<String, dynamic>() ?? const {};
      final origin = metadata['origin']?.toString() ?? 'Create';
      final isLearn = origin == 'Learn';

      _items.insert(
        0,
        LibraryEntry(
          id: remoteId,
          remoteId: remoteId,
          challengeTitle:
              metadata['title']?.toString() ??
              artwork['title']?.toString() ??
              'Untitled challenge',
          origin: origin,
          conceptTitle: metadata['conceptTitle']?.toString(),
          photoTint: isLearn ? AppColors.tealTint : AppColors.marigoldTint,
          photoGlyph: isLearn ? IconGlyph.symmetry : IconGlyph.spark,
          date:
              DateTime.tryParse(artwork['createdAt']?.toString() ?? '') ??
              DateTime.now(),
        ),
      );
    }
  }
}
