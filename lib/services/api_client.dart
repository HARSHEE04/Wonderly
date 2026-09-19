import 'dart:convert';
import 'package:http/http.dart' as http;

/// Matches the `demo-user` seeded by the backend's `npm run seed` script
/// (`src/data/seed.ts`). There's no auth in this wireframe, so every device
/// shares this identity.
const String demoUserId = 'demo-user';

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => 'ApiException: $message';
}

/// The result of starting a Learn session: the backend session id plus the
/// `ChallengeDecision` JSON (`src/core/types/visual.ts`) it recommended for
/// the scanned scene, if any.
class LearnSessionResult {
  final String sessionId;
  final Map<String, dynamic>? decision;
  const LearnSessionResult({required this.sessionId, this.decision});
}

/// Thin client for the Node/Express backend in this repo (`src/server.ts`).
/// Every call can throw [ApiException] or a network error — callers should
/// catch and fall back to local/mock behavior so the wireframe still works
/// with the backend offline.
class ApiClient {
  ApiClient._();
  static final ApiClient _instance = ApiClient._();
  factory ApiClient() => _instance;

  /// Backend always runs on port 4000 (see `.env`), on the same host that's
  /// serving this Flutter web build — so this works whether that host is
  /// `localhost` or a LAN IP, without hardcoding either.
  static String get baseUrl {
    final host = Uri.base.host.isNotEmpty ? Uri.base.host : 'localhost';
    return 'http://$host:4000';
  }

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Map<String, dynamic> _unwrap(http.Response res) {
    final decoded = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400 || decoded['success'] == false) {
      final message = (decoded['error'] as Map?)?['message']?.toString() ?? 'Request failed (${res.statusCode})';
      throw ApiException(message);
    }
    return decoded;
  }

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    final res = await http
        .post(_uri(path), headers: const {'Content-Type': 'application/json'}, body: jsonEncode(body))
        .timeout(const Duration(seconds: 8));
    final decoded = _unwrap(res);
    return decoded['data'] as Map<String, dynamic>? ?? {};
  }

  Future<List<dynamic>> _getList(String path) async {
    final res = await http.get(_uri(path)).timeout(const Duration(seconds: 8));
    final decoded = _unwrap(res);
    return decoded['data'] as List<dynamic>? ?? [];
  }

  Future<String> createSession({required String userId, required String mode}) async {
    final data = await _post('/api/sessions', {'userId': userId, 'mode': mode});
    return data['id'] as String;
  }

  /// Posts the (currently mocked) scene analysis and returns the backend's
  /// `ChallengeDecision`, or null if the scene had insufficient features.
  Future<Map<String, dynamic>?> postSceneAnalysis({
    required String sessionId,
    required Map<String, dynamic> scene,
  }) async {
    final data = await _post('/api/sessions/$sessionId/scene-analysis', scene);
    final recommendation = data['recommendation'] as Map<String, dynamic>?;
    return recommendation?['decision'] as Map<String, dynamic>?;
  }

  Future<Map<String, dynamic>?> recommendChallenge({
    required Map<String, dynamic> scene,
    required String userId,
  }) async {
    final data = await _post('/api/challenges/recommend', {'sceneAnalysis': scene, 'userId': userId});
    return data['decision'] as Map<String, dynamic>?;
  }

  Future<void> completeSession({
    required String sessionId,
    required String userId,
    String? challengeType,
    Map<String, dynamic>? metadata,
  }) async {
    await _post('/api/sessions/$sessionId/complete', {
      'userId': userId,
      if (challengeType != null) 'challengeType': challengeType,
      if (metadata != null) 'artworkMetadata': metadata,
    });
  }

  Future<List<Map<String, dynamic>>> getArtworks(String userId) async {
    final list = await _getList('/api/users/$userId/artworks');
    return list.cast<Map<String, dynamic>>();
  }
}
