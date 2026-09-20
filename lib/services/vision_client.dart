import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

import 'api_client.dart';

/// Real analysis returned by the Python Vision service.
class VisionAnalysisResult {
  final Map<String, dynamic> sceneAnalysis;
  final Map<String, dynamic>? decision;

  const VisionAnalysisResult({required this.sceneAnalysis, this.decision});
}

class VisionClient {
  /// An explicit override, e.g. `--dart-define=VISION_BASE_URL=http://192.168.1.23:8001`
  /// — required on a physical device or simulator, where `localhost` means
  /// the device itself, not the Mac running this service.
  static const String _override = String.fromEnvironment('VISION_BASE_URL');

  /// Mirrors [ApiClient.baseUrl]'s host resolution: on web, read the page's
  /// own host; on a native build with no [_override], fall back to
  /// `127.0.0.1`, which only works on Flutter web/desktop or the iOS
  /// Simulator (it shares the Mac's network stack) — not a physical device.
  static String get baseUrl {
    if (_override.isNotEmpty) return _override;
    final host = kIsWeb
        ? (Uri.base.host.isNotEmpty ? Uri.base.host : '127.0.0.1')
        : '127.0.0.1';
    return 'http://$host:8001';
  }

  Future<VisionAnalysisResult> analyzeImage({
    required Uint8List imageBytes,
    required String sessionId,
  }) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/analyze'),
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Session-Id': sessionId,
          },
          body: imageBytes,
        )
        .timeout(const Duration(seconds: 45));

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode != 200 || decoded['success'] != true) {
      throw ApiException(
        decoded['error']?.toString() ??
            'Vision service failed (HTTP ${response.statusCode})',
      );
    }

    final sceneAnalysis =
        decoded['sceneAnalysis'] as Map<String, dynamic>?;

    final backendResponse =
        decoded['backendResponse'] as Map<String, dynamic>?;

    if (sceneAnalysis == null ||
        backendResponse == null ||
        backendResponse['success'] != true) {
      throw ApiException(
        'The Vision service did not return a complete analysis.',
      );
    }

    final backendData =
        backendResponse['data'] as Map<String, dynamic>?;

    final recommendation =
        backendData?['recommendation'] as Map<String, dynamic>?;

    final decision =
        recommendation?['decision'] as Map<String, dynamic>?;

    return VisionAnalysisResult(
      sceneAnalysis: sceneAnalysis,
      decision: decision,
    );
  }
}