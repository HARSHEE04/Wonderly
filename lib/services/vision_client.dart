import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

import 'api_client.dart';

/// Real analysis returned by the Python Vision service.
class VisionAnalysisResult {
  final Map<String, dynamic> sceneAnalysis;
  final LearnSessionResult sessionResult;

  const VisionAnalysisResult({
    required this.sceneAnalysis,
    required this.sessionResult,
  });
}

class VisionClient {
  /// For Flutter web running on the same computer as the Python service.
  static String get baseUrl {
    final host = Uri.base.host.isNotEmpty ? Uri.base.host : '127.0.0.1';
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
      sessionResult: LearnSessionResult(
        sessionId: sessionId,
        decision: decision,
      ),
    );
  }
}