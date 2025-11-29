import 'dart:async';
import 'package:http/http.dart' as http;

class IpfsHelper {
  static final Map<String, String> _cache = {};

  static const List<String> gateways = [
    "https://cloudflare-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/",
    "https://ipfs.io/ipfs/",
    "https://w3s.link/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://infura-ipfs.io/ipfs/",
  ];

  static String extractCID(String uri) {
    if (uri.startsWith("ipfs://")) {
      uri = uri.replaceFirst("ipfs://", "");
    }
    uri = uri.replaceAll("ipfs/", "");
    uri = uri.replaceAll("ipfs://ipfs/", "");

    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      return uri;
    }
    return uri;
  }

  static Future<bool> _checkUrl(String url) async {
    try {
      final res = await http.get(Uri.parse(url))
          .timeout(const Duration(seconds: 3));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<String> resolve(String? uri) async {
    if (uri == null || uri.isEmpty) return "";

    if (_cache.containsKey(uri)) {
      return _cache[uri]!;
    }

    final cid = extractCID(uri);

    if (cid.startsWith("https://") || cid.startsWith("http://")) {
      return cid;
    }

    for (final gateway in gateways) {
      final link = "$gateway$cid";
      final ok = await _checkUrl(link);
      if (ok) {
        _cache[uri] = link;
        return link;
      }
    }

    return "https://cloudflare-ipfs.com/ipfs/$cid";
  }
}
