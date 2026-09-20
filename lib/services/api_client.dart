import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

import '../data/models.dart';

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
  final LearningContent learningContent;
  const LearnSessionResult({
    required this.sessionId,
    required this.learningContent,
    this.decision,
  });
}

/// Thin client for the Node/Express backend in this repo (`src/server.ts`).
/// Every call can throw [ApiException] or a network error — callers should
/// catch and fall back to local/mock behavior so the wireframe still works
/// with the backend offline.
class ApiClient {
  ApiClient._();
  static final ApiClient _instance = ApiClient._();
  factory ApiClient() => _instance;

  /// An explicit override, e.g. `--dart-define=API_BASE_URL=https://foo.trycloudflare.com`
  /// — needed when the app and backend are served from different origins,
  /// such as two separate tunnels, where the app can't infer the backend's
  /// address from its own URL.
  static const String _override = String.fromEnvironment('API_BASE_URL');

  /// Backend always runs on port 4000 (see `.env`) unless [_override] is set.
  /// On web, it's normally served from the same host as this build
  /// (`localhost` or a LAN IP), read off the page's own URL. On a native
  /// build (iOS Simulator, physical device), there's no page URL to read —
  /// the iOS Simulator shares the Mac's network stack, so `localhost`
  /// reaches a backend running on the host machine directly.
  static String get baseUrl {
    if (_override.isNotEmpty) return _override;
    final host = kIsWeb
        ? (Uri.base.host.isNotEmpty ? Uri.base.host : 'localhost')
        : 'localhost';
    return 'http://$host:4000';
  }

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Map<String, dynamic> _unwrap(http.Response res) {
    final decoded = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400 || decoded['success'] == false) {
      final message =
          (decoded['error'] as Map?)?['message']?.toString() ??
          'Request failed (${res.statusCode})';
      throw ApiException(message);
    }
    return decoded;
  }

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> body, {
    Duration timeout = const Duration(seconds: 8),
  }) async {
    final res = await http
        .post(
          _uri(path),
          headers: const {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        )
        .timeout(timeout);
    final decoded = _unwrap(res);
    return decoded['data'] as Map<String, dynamic>? ?? {};
  }

  Future<List<dynamic>> _getList(String path) async {
    final res = await http.get(_uri(path)).timeout(const Duration(seconds: 8));
    final decoded = _unwrap(res);
    return decoded['data'] as List<dynamic>? ?? [];
  }

  /// Uploads a captured photo to the backend's OpenCV pipeline
  /// (`computer_vision/scene_analysis.py`) and returns the raw SceneAnalysis
  /// JSON (colors/shapes/textures/lines/patterns) it detected.
  Future<Map<String, dynamic>> analyzeScan(Uint8List photoBytes) async {
    final res = await http
        .post(
          _uri('/api/scan/analyze'),
          headers: const {'Content-Type': 'image/jpeg'},
          body: photoBytes,
        )
        .timeout(const Duration(seconds: 20));
    final decoded = _unwrap(res);
    return decoded['data'] as Map<String, dynamic>? ?? {};
  }

  Future<String> createSession({
    required String userId,
    required String mode,
  }) async {
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

  Future<Map<String, dynamic>> createChallengeInstance({
    required String sessionId,
    required String title,
    required String instructions,
  }) {
    return _post('/api/sessions/$sessionId/challenge-instance', {
      'title': title,
      'instructions': instructions,
    });
  }

  Future<Map<String, dynamic>> generateCreativeChallenge(
    String sessionId, {
    Map<String, dynamic>? learningContext,
  }) {
    return _post('/api/sessions/$sessionId/creative-challenge', {
      if (learningContext != null) 'learningContext': learningContext,
    }, timeout: const Duration(seconds: 30));
  }

  Future<LearningContent> generateLearningContent(String sessionId) async {
    final data = await _post('/api/learning/content', {
      'sessionId': sessionId,
    }, timeout: const Duration(seconds: 30));
    return LearningContent.fromJson(data);
  }

  Future<List<Map<String, dynamic>>> getChallengeHistory(String userId) async {
    final list = await _getList('/api/users/$userId/challenge-instances');
    return list.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>?> recommendChallenge({
    required Map<String, dynamic> scene,
    required String userId,
  }) async {
    final data = await _post('/api/challenges/recommend', {
      'sceneAnalysis': scene,
      'userId': userId,
    });
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
