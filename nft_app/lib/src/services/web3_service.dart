import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart' as http;

import 'package:nft_app/src/config/environment.dart';
import 'package:nft_app/src/services/wallet_connect_service.dart';

class Web3Service {
  Web3Service._internal();
  static final Web3Service _instance = Web3Service._internal();
  factory Web3Service() => _instance;

  final WalletConnectService _wc = WalletConnectService();
  Web3Client? _client;
  http.Client? _httpClient;

  Future<void> init() async {
    await _wc.init();
    if (_client == null) {
      _httpClient = http.Client();
      _client = Web3Client(Environment.rpcUrl, _httpClient!);
    }
  }

  /// Connects to wallet (Trust Wallet via WalletConnect) and returns the wallet address
  Future<String> connect() async {
    await init();
    final address = await _wc.connectWithWallet();
    return address;
  }

  Future<void> disconnect({bool clearStoredData = false}) async {
    await _wc.disconnect(clearStoredData: clearStoredData);
  }

  /// Read-only Web3 client for RPC calls (balances, contract calls, etc.)
  Web3Client get client {
    if (_client == null) {
      _httpClient = http.Client();
      _client = Web3Client(Environment.rpcUrl, _httpClient!);
    }
    return _client!;
  }

  /// Get ETH balance for an address
  Future<EtherAmount> getBalance(String address) async {
    await init();
    final ethAddress = EthereumAddress.fromHex(address);
    return client.getBalance(ethAddress);
  }

  /// Convenience wrapper to send transaction via WalletConnect (delegates to WalletConnectService)
  Future<String> sendTransaction({
    required String to,
    required String data,
    String? value,
    String? gas,
    String? gasPrice,
    bool autoDisconnect = false,
    bool autoOpenWallet = true,
  }) async {
    await init();
    return _wc.sendTransaction(
      to: to,
      data: data,
      value: value,
      gas: gas,
      gasPrice: gasPrice,
      autoDisconnect: autoDisconnect,
      autoOpenWallet: autoOpenWallet,
    );
  }

  Future<String> signMessage(String message) async {
    await init();
    return _wc.signMessage(message);
  }

  Future<String> signTypedData(String typedDataJson) async {
    await init();
    return _wc.signTypedData(typedDataJson);
  }

  void dispose() {
    _httpClient?.close();
    _client = null;
    _httpClient = null;
  }
}
