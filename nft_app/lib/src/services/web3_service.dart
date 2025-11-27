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

  /// Địa chỉ ví hiện tại (đã connect trong phiên app)
  String? _currentAddress;

  Future<void> init() async {
    await _wc.init();
    if (_client == null) {
      _httpClient = http.Client();
      _client = Web3Client(Environment.rpcUrl, _httpClient!);
    }
  }

  /// Kết nối Trust Wallet & trả về địa chỉ ví
  Future<String> connect() async {
    await init();
    final address = await _wc.connectWithWallet();
    _currentAddress = address; // 🔥 lưu lại để dùng cho History, v.v.
    return address;
  }

  /// Lấy địa chỉ ví đang dùng trong app (nếu chưa connect -> trả về chuỗi rỗng)
  Future<String> getCurrentAddress() async {
    await init();
    return _currentAddress ?? '';
  }

  Future<void> disconnect({bool clearStoredData = false}) async {
    await _wc.disconnect(clearStoredData: clearStoredData);
    _currentAddress = null;
  }

  /// Read-only Web3 client cho các RPC call (balance, contract, ...)
  Web3Client get client {
    if (_client == null) {
      _httpClient = http.Client();
      _client = Web3Client(Environment.rpcUrl, _httpClient!);
    }
    return _client!;
  }

  /// Lấy ETH balance của 1 address
  Future<EtherAmount> getBalance(String address) async {
    await init();
    final ethAddress = EthereumAddress.fromHex(address);
    return client.getBalance(ethAddress);
  }

  /// Gửi transaction qua WalletConnect
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
