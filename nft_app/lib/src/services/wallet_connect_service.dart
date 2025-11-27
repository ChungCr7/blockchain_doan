import 'dart:async';
import 'dart:convert';

import 'package:reown_appkit/reown_appkit.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/services.dart';

import 'package:nft_app/src/config/environment.dart';

class WalletConnectService {
  WalletConnectService._internal();
  static final WalletConnectService _instance =
      WalletConnectService._internal();
  factory WalletConnectService() => _instance;

  ReownAppKit? _appKit;
  SessionData? _activeSession;
  bool _isPendingTransaction = false;
  bool _isPendingSignature = false;
  bool _isPendingApproval = false;
  String? _lastWalletConnectUri;
  final StreamController<String> _uriFallbackController =
      StreamController<String>.broadcast();

  Stream<String> get onUriCopied => _uriFallbackController.stream;

  bool hasPendingRequest() {
    return _isPendingTransaction || _isPendingSignature;
  }

  Future<void> init() async {
    if (_appKit != null) return;
    final projectId = Environment.walletConnectProjectId;
    if (projectId.isEmpty) {
      throw StateError('Missing WALLETCONNECT_PROJECT_ID in .env');
    }
    _appKit = await ReownAppKit.createInstance(
      projectId: projectId,
      metadata: const PairingMetadata(
        name: 'SSI Mobile',
        description: 'SSI Mobile WalletConnect',
        url: 'https://ssi.example',
        icons: [
          'https://images.seeklogo.com/logo-png/43/1/walletconnect-logo-png_seeklogo-430923.png',
        ],
      ),
    );
    await _restoreActiveSession();
  }

  Future<void> _restoreActiveSession() async {
    if (_appKit == null) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedOut = prefs.getBool('walletconnect_logged_out') ?? false;
      if (isLoggedOut) {
        await prefs.remove('walletconnect_logged_out');
        return;
      }
    } catch (e) {}
    try {
      final activeSessions = _appKit!.getActiveSessions();
      if (activeSessions.isNotEmpty) {
        final session = activeSessions.values.first;
        _activeSession = session;
      }
    } catch (e) {}
  }

  Future<String?> getActiveSessionAddress() async {
    await init();
    if (_activeSession != null) {
      try {
        final account = _firstAccountFromSession(_activeSession!);
        final address = _extractAddressFromAccount(account);
        if (_isValidEthereumAddress(address)) return address;
      } catch (e) {}
    }
    return null;
  }

  Future<String?> getStoredAddress() async {
    await init();
    if (_activeSession != null) {
      try {
        final account = _firstAccountFromSession(_activeSession!);
        final address = _extractAddressFromAccount(account);
        if (_isValidEthereumAddress(address)) return address;
      } catch (e) {
        _activeSession = null;
      }
    }
    return null;
  }

  Future<void> disconnect({bool clearStoredData = false}) async {
    final app = _appKit;
    if (app != null) {
      if (clearStoredData) {
        try {
          final activeSessions = app.getActiveSessions();
          for (final session in activeSessions.values) {
            try {
              await app.disconnectSession(
                topic: session.topic,
                reason: const ReownSignError(
                  code: 6000,
                  message: 'Session disconnected',
                ),
              );
            } catch (e) {}
          }
        } catch (e) {}
      } else {
        final topic = _activeSession?.topic;
        if (topic != null) {
          try {
            await app.disconnectSession(
              topic: topic,
              reason: const ReownSignError(
                code: 6000,
                message: 'Session disconnected',
              ),
            );
          } catch (e) {}
        }
      }
    }
    _activeSession = null;
    _lastWalletConnectUri = null;
    if (clearStoredData) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('walletconnect_logged_out', true);
    }
  }

  Future<String> connectWithWallet({String? walletUniversalLink}) async {
    await init();
    final app = _appKit!;
    try {
      final prefs = await SharedPreferences.getInstance();
      final awaiting =
          prefs.getBool('walletconnect_awaiting_approval') ?? false;
      if (awaiting) {
        await prefs.remove('walletconnect_awaiting_approval');
      }
    } catch (e) {}
    if (_activeSession != null) {
      await disconnect();
    }
    final sepoliaChain = Environment.sepoliaChainEip155;
    final ethereumMainnet = Environment.ethereumMainnetEip155;
    final connectResponse = await app.connect(
      optionalNamespaces: {
        'eip155': RequiredNamespace(
          methods: const [
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
            'eth_sendTransaction',
            'wallet_switchEthereumChain',
            'wallet_addEthereumChain',
          ],
          chains: [sepoliaChain, ethereumMainnet],
          events: const ['accountsChanged', 'chainChanged'],
        ),
      },
    );

    final uri = connectResponse.uri;
    if (uri != null) {
      final wcUri = uri.toString();
      _lastWalletConnectUri = wcUri;
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('walletconnect_awaiting_approval', true);
        _isPendingApproval = true;
      } catch (e) {}

      final trustScheme = Uri.parse(
        'trust://wc?uri=${Uri.encodeComponent(wcUri)}',
      );
      final trustUniversal = Uri.parse(
        'https://link.trustwallet.com/wc?uri=${Uri.encodeComponent(wcUri)}',
      );
      final rawWc = Uri.parse(wcUri);

      bool launched = false;
      if (walletUniversalLink != null) {
        final provided = Uri.parse(
          '$walletUniversalLink/wc?uri=${Uri.encodeComponent(wcUri)}',
        );
        try {
          launched = await launchUrl(
            provided,
            mode: LaunchMode.externalApplication,
          );
        } catch (e) {
          launched = false;
        }
      }
      if (!launched) {
        try {
          launched = await launchUrl(
            trustScheme,
            mode: LaunchMode.externalApplication,
          );
        } catch (e) {
          launched = false;
        }
      }
      if (!launched) {
        try {
          launched = await launchUrl(
            trustUniversal,
            mode: LaunchMode.externalApplication,
          );
        } catch (e) {
          launched = false;
        }
      }
      if (!launched) {
        try {
          launched = await launchUrl(
            rawWc,
            mode: LaunchMode.externalApplication,
          );
        } catch (e) {
          launched = false;
        }
      }

      if (!launched) {
        try {
          await Clipboard.setData(ClipboardData(text: wcUri));
          try {
            _uriFallbackController.add(wcUri);
          } catch (_) {}
        } catch (e2) {}
      }
    }

    late SessionData session;
    try {
      session = await connectResponse.session.future.timeout(
        const Duration(minutes: 5),
      );
    } finally {
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('walletconnect_awaiting_approval');
      } catch (e) {}
      _isPendingApproval = false;
    }

    _activeSession = session;

    String address;
    try {
      final account = _firstAccountFromSession(session);
      address = _extractAddressFromAccount(account);
    } catch (e) {
      address = _extractAddressAlternative(session);
      if (address.isEmpty) rethrow;
    }

    if (address.isEmpty || !_isValidEthereumAddress(address)) {
      throw StateError('Invalid wallet address extracted: $address');
    }

    final currentChainId = _getCurrentChainId(session);
    final targetSepoliaChainId = Environment.chainId;

    if (currentChainId != targetSepoliaChainId) {
      try {
        await switchToSepolia().timeout(const Duration(seconds: 10));
      } catch (e) {}
    }

    return address;
  }

  int? _getCurrentChainId(SessionData session) {
    try {
      final accounts = session.namespaces['eip155']?.accounts;
      if (accounts != null && accounts.isNotEmpty) {
        final firstAccount = accounts.first;
        final parts = firstAccount.split(':');
        if (parts.length >= 2) return int.tryParse(parts[1]);
      }
    } catch (e) {}
    return null;
  }

  Future<void> switchToSepolia() async {
    final app = _appKit;
    final session = _activeSession;
    if (app == null || session == null) return;
    final sepoliaChainId = Environment.chainId;
    final sepoliaChainIdHex = Environment.sepoliaChainIdHex;
    final currentAccounts = session.namespaces['eip155']?.accounts;
    if (currentAccounts == null || currentAccounts.isEmpty) return;
    String chainIdToUse;
    try {
      final sepoliaAccount = currentAccounts.firstWhere(
        (account) => account.contains(':$sepoliaChainId:'),
      );
      chainIdToUse = sepoliaAccount.split(':').take(2).join(':');
    } catch (_) {
      chainIdToUse = currentAccounts.first.split(':').take(2).join(':');
    }

    try {
      await app.request(
        topic: session.topic,
        chainId: chainIdToUse,
        request: SessionRequestParams(
          method: 'wallet_switchEthereumChain',
          params: [
            {'chainId': sepoliaChainIdHex},
          ],
        ),
      );
    } catch (e) {
      try {
        await app.request(
          topic: session.topic,
          chainId: chainIdToUse,
          request: SessionRequestParams(
            method: 'wallet_addEthereumChain',
            params: [
              {
                'chainId': sepoliaChainIdHex,
                'chainName': Environment.sepoliaChainName,
                'rpcUrls': [Environment.rpcUrl],
                'nativeCurrency': {
                  'name': 'ETH',
                  'symbol': 'ETH',
                  'decimals': 18,
                },
                'blockExplorerUrls': [Environment.sepoliaExplorerUrl],
              },
            ],
          ),
        );
      } catch (e2) {}
    }
  }

  Future<String> signMessage(String message) async {
    final app = _appKit;
    final session = _activeSession;
    if (app == null || session == null) {
      throw StateError('Wallet not connected');
    }
    final account = _firstAccountFromSession(session);
    final address = _extractAddressFromAccount(account);
    final signature = await app.request(
      topic: session.topic,
      chainId: 'eip155:${Environment.chainId}',
      request: SessionRequestParams(
        method: 'personal_sign',
        params: [message, address],
      ),
    );
    return signature as String;
  }

  Future<String> sendTransaction({
    required String to,
    required String data,
    String? value,
    String? gas,
    String? gasPrice,
    bool autoDisconnect = false,
    bool autoOpenWallet = true,
  }) async {
    final app = _appKit;
    final session = _activeSession;
    if (app == null || session == null) {
      throw StateError(
        'Wallet not connected. Please connect your wallet first.',
      );
    }

    final account = _firstAccountFromSession(session);
    final from = _extractAddressFromAccount(account);
    final transactionParams = <String, dynamic>{
      'from': from,
      'to': to,
      'data': data,
    };
    if (value != null && value.isNotEmpty) {
      if (!value.startsWith('0x')) {
        final bigIntValue = BigInt.parse(value);
        transactionParams['value'] = '0x${bigIntValue.toRadixString(16)}';
      } else {
        transactionParams['value'] = value;
      }
    }
    if (gas != null && gas.isNotEmpty) {
      if (!gas.startsWith('0x')) {
        final bigIntGas = BigInt.parse(gas);
        transactionParams['gas'] = '0x${bigIntGas.toRadixString(16)}';
      } else {
        transactionParams['gas'] = gas;
      }
    }
    if (gasPrice != null && gasPrice.isNotEmpty) {
      if (!gasPrice.startsWith('0x')) {
        final bigIntGasPrice = BigInt.parse(gasPrice);
        transactionParams['gasPrice'] = '0x${bigIntGasPrice.toRadixString(16)}';
      } else {
        transactionParams['gasPrice'] = gasPrice;
      }
    }

    try {
      final activeSessions = app.getActiveSessions();
      if (!activeSessions.containsKey(session.topic)) {
        throw StateError(
          'WalletConnect session is no longer active. Please reconnect your wallet.',
        );
      }
    } catch (e) {}

    try {
      final requestParams = SessionRequestParams(
        method: 'eth_sendTransaction',
        params: [transactionParams],
      );
      final requestFuture = app.request(
        topic: session.topic,
        chainId: 'eip155:${Environment.chainId}',
        request: requestParams,
      );
      _isPendingTransaction = true;
      if (autoOpenWallet) {
        unawaited(_tryOpenWalletApp());
      }
      final result = await requestFuture.timeout(const Duration(minutes: 5));
      String txHash;
      if (result is String) {
        txHash = result;
      } else if (result is Map)
        txHash = result.values.first.toString();
      else
        txHash = result.toString();
      txHash = txHash
          .replaceAll('"', '')
          .replaceAll("'", '')
          .replaceAll('[', '')
          .replaceAll(']', '')
          .trim();
      if (!txHash.startsWith('0x')) txHash = '0x$txHash';
      _isPendingTransaction = false;
      return txHash;
    } on TimeoutException {
      _isPendingTransaction = false;
      rethrow;
    } catch (e) {
      _isPendingTransaction = false;
      rethrow;
    }
  }

  Future<String?> _getStoredWalletConnectUri() async {
    return _lastWalletConnectUri;
  }

  Future<String?> getLastWalletConnectUri() async {
    return _lastWalletConnectUri;
  }

  Future<bool> copyLastWalletConnectUriToClipboard() async {
    final uri = await getLastWalletConnectUri();
    if (uri == null || uri.isEmpty) return false;
    try {
      await Clipboard.setData(ClipboardData(text: uri));
      try {
        _uriFallbackController.add(uri);
      } catch (_) {}
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> _tryOpenWalletApp() async {
    try {
      final walletConnectUri = await _getStoredWalletConnectUri();
      if (walletConnectUri != null && walletConnectUri.isNotEmpty) {
        final trustWcUri = Uri.parse(
          'trust://wc?uri=${Uri.encodeComponent(walletConnectUri)}',
        );
        try {
          await launchUrl(trustWcUri, mode: LaunchMode.externalApplication);
          return;
        } catch (e) {}
      }
    } catch (e) {}
  }

  Future<String> signTypedData(String typedDataJson) async {
    final app = _appKit;
    final session = _activeSession;
    if (app == null || session == null) {
      throw StateError(
        'Wallet not connected. Please connect your wallet first.',
      );
    }
    final account = _firstAccountFromSession(session);
    final address = _extractAddressFromAccount(account);
    final typedData = jsonDecode(typedDataJson) as Map<String, dynamic>;
    final formattedTypedData = _formatTypedDataForWalletConnect(typedData);
    final requestParams = SessionRequestParams(
      method: 'eth_signTypedData_v4',
      params: [address, jsonEncode(formattedTypedData)],
    );
    final requestFuture = app.request(
      topic: session.topic,
      chainId: 'eip155:${Environment.chainId}',
      request: requestParams,
    );
    _isPendingSignature = true;
    unawaited(_tryOpenWalletApp());
    final result = await requestFuture.timeout(const Duration(minutes: 5));
    String signature;
    if (result is String) {
      signature = result;
    } else if (result is Map)
      signature = result.values.first.toString();
    else
      signature = result.toString();
    signature = signature
        .replaceAll('"', '')
        .replaceAll("'", '')
        .replaceAll('[', '')
        .replaceAll(']', '')
        .trim();
    if (!signature.startsWith('0x')) signature = '0x$signature';
    _isPendingSignature = false;
    return signature;
  }

  Future<bool> isConnected() async {
    await init();
    if (_activeSession != null) return true;
    return false;
  }

  Future<bool> hasActiveSession() async {
    await init();
    if (_appKit == null) return false;
    try {
      final activeSessions = _appKit!.getActiveSessions();
      if (activeSessions.isNotEmpty) {
        if (_activeSession == null ||
            !activeSessions.containsKey(_activeSession!.topic)) {
          _activeSession = activeSessions.values.first;
        }
        return true;
      }
    } catch (e) {}
    final hasActive = _activeSession != null;
    return hasActive;
  }

  bool isPendingTransactionOrSignature() {
    return _isPendingTransaction || _isPendingSignature || _isPendingApproval;
  }

  void clearPendingFlags() {
    _isPendingTransaction = false;
    _isPendingSignature = false;
  }

  String _firstAccountFromSession(SessionData session) {
    final eip155Namespace = session.namespaces['eip155'];
    if (eip155Namespace != null) {
      final accounts = eip155Namespace.accounts;
      if (accounts.isNotEmpty) {
        final sepoliaChainId = Environment.chainId;
        final sepoliaAccount = accounts.firstWhere(
          (account) => account.contains(':$sepoliaChainId:'),
          orElse: () => accounts.first,
        );
        return sepoliaAccount;
      }
    }
    for (final namespaceKey in session.namespaces.keys) {
      final namespace = session.namespaces[namespaceKey];
      if (namespace != null) {
        final accounts = namespace.accounts;
        if (accounts.isNotEmpty) return accounts.first;
      }
    }
    throw StateError('No accounts found in WalletConnect session.');
  }

  String _extractAddressFromAccount(String account) {
    if (account.contains(':')) {
      final parts = account.split(':');
      return parts.last;
    }
    return account;
  }

  String _extractAddressAlternative(SessionData session) {
    try {
      for (final namespace in session.namespaces.values) {
        final accounts = namespace.accounts;
        for (final account in accounts) {
          final address = _extractAddressFromAccount(account);
          if (_isValidEthereumAddress(address)) return address;
        }
      }
    } catch (e) {}
    return '';
  }

  bool _isValidEthereumAddress(String address) {
    final cleanAddress = address.toLowerCase().replaceFirst('0x', '');
    return RegExp(r'^[0-9a-f]{40} *').hasMatch(cleanAddress) ||
        RegExp(r'^[0-9a-f]{40} *$').hasMatch(cleanAddress);
  }

  Map<String, dynamic> _formatTypedDataForWalletConnect(
    Map<String, dynamic> typedData,
  ) {
    final formatted = jsonDecode(jsonEncode(typedData)) as Map<String, dynamic>;
    final domain = formatted['domain'] as Map<String, dynamic>?;
    if (domain != null && domain['chainId'] != null) {
      if (domain['chainId'] is String) {
        try {
          domain['chainId'] = int.parse(domain['chainId'] as String);
        } catch (e) {}
      } else if (domain['chainId'] is BigInt) {
        domain['chainId'] = (domain['chainId'] as BigInt).toInt();
      }
    }
    if (domain != null && domain['verifyingContract'] != null) {
      try {
        final contractAddress = domain['verifyingContract'] as String;
        domain['verifyingContract'] = contractAddress;
      } catch (e) {}
    }
    return formatted;
  }
}
