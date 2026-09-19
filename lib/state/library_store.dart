import '../data/mock_data.dart';
import '../data/models.dart';

/// In-memory mock store for saved Library entries. Will be replaced by the
/// real MongoDB-backed persistence another teammate owns.
class LibraryStore {
  LibraryStore._();
  static final LibraryStore instance = LibraryStore._();

  final List<LibraryEntry> _items = buildSeedLibrary();

  List<LibraryEntry> get items => List.unmodifiable(_items);

  void add(LibraryEntry entry) => _items.insert(0, entry);
}
