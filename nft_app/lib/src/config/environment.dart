import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Environment values.
/// Priority: 1) compile-time `--dart-define` (String.fromEnvironment)
///           2) runtime `.env` loaded by `flutter_dotenv`
///           3) hard-coded defaults below
class Environment {
  static String _fromDefine(String key) =>
      String.fromEnvironment(key, defaultValue: '');

  static String _fromEnvOrDefault(String key, String defaultValue) {
    final fromDefine = _fromDefine(key);
    if (fromDefine.isNotEmpty) return fromDefine;
    try {
      final dot = dotenv.env[key];
      if (dot != null && dot.isNotEmpty) return dot;
    } catch (_) {}
    return defaultValue;
  }

  static String get rpcUrl => _fromEnvOrDefault(
    'RPC_URL',
    // Intentionally empty by default to avoid embedding API keys in source.
    // Set this in `.env` (dev) or via `--dart-define` in CI/production.
    '',
  );

  static String get walletConnectProjectId => _fromEnvOrDefault(
    'WALLETCONNECT_PROJECT_ID',
    // Leave empty by default; provide value via .env or --dart-define.
    '',
  );

  static const int chainId = 11155111; // Sepolia
  static const String sepoliaChainIdHex = '0xaa36a7';
  static const String sepoliaChainName = 'Sepolia Testnet';
  static const String sepoliaChainEip155 = 'eip155:11155111';
  static const String ethereumMainnetEip155 = 'eip155:1';
  static const String sepoliaExplorerUrl = 'https://sepolia.etherscan.io';

  static String get contractAddress => _fromEnvOrDefault(
    'CONTRACT_ADDRESS',
    // Leave blank by default; set your contract address in .env or via --dart-define.
    '',
  );
}
