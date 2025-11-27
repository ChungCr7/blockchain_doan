import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// PinataService: dùng dotenv (.env) để lấy PINATA_API_KEY và PINATA_SECRET
/// Không còn dùng String.fromEnvironment nữa.
class PinataService {
  PinataService._();

  static const _base = 'https://api.pinata.cloud/pinning';

  static String get _apiKey => dotenv.env['PINATA_API_KEY'] ?? '';
  static String get _apiSecret => dotenv.env['PINATA_SECRET'] ?? '';

  static void _ensureKeys() {
    if (_apiKey.isEmpty || _apiSecret.isEmpty) {
      throw Exception('Pinata API keys missing — check your .env file');
    }
  }

  /// Upload FILE to Pinata
  static Future<String> uploadFile(File file, {String? fileName}) async {
    _ensureKeys();

    final uri = Uri.parse('$_base/pinFileToIPFS');
    final request = http.MultipartRequest('POST', uri);

    request.headers.addAll({
      'pinata_api_key': _apiKey,
      'pinata_secret_api_key': _apiSecret,
    });

    request.files.add(
      await http.MultipartFile.fromPath(
        'file',
        file.path,
        filename: fileName ?? file.path.split(Platform.pathSeparator).last,
      ),
    );

    final streamed = await request.send();
    final resp = await http.Response.fromStream(streamed);

    if (resp.statusCode != 200) {
      throw Exception(
        'Pinata file upload failed: ${resp.statusCode} ${resp.body}',
      );
    }

    final body = jsonDecode(resp.body);
    final hash = body['IpfsHash'];
    if (hash == null) throw Exception('Pinata response missing IpfsHash');

    return 'ipfs://$hash';
  }

  /// Upload JSON metadata to Pinata
  static Future<String> uploadJson(Map<String, dynamic> jsonData) async {
    _ensureKeys();

    final uri = Uri.parse('$_base/pinJSONToIPFS');

    final response = await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': _apiKey,
        'pinata_secret_api_key': _apiSecret,
      },
      body: jsonEncode(jsonData),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Pinata JSON upload failed: ${response.statusCode} ${response.body}',
      );
    }

    final body = jsonDecode(response.body);
    final hash = body['IpfsHash'];
    if (hash == null) throw Exception('Pinata response missing IpfsHash');

    return 'ipfs://$hash';
  }
}
