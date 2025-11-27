import 'dart:typed_data';

import 'package:web3dart/web3dart.dart';
import 'package:web3dart/crypto.dart' show bytesToHex;

import 'package:nft_app/src/config/environment.dart';
import 'package:nft_app/src/services/web3_service.dart';

class ContractService {
  ContractService._internal();
  static final ContractService _instance = ContractService._internal();
  factory ContractService() => _instance;

  final Web3Service _web3 = Web3Service();

  DeployedContract? _contract;

  late ContractFunction _fnGetActiveListings;
  late ContractFunction _fnCreateNFT;
  late ContractFunction _fnListNFT;
  late ContractFunction _fnBuyNFT;
  late ContractFunction _fnGetNFT;
  late ContractFunction _fnOwnerOf;
  late ContractFunction _fnTotalSupply;

  // ------------------------------------------------------
  // ABI CỦA CONTRACT NFTMarketplace (đã rút gọn theo code Solidity anh gửi)
  // ------------------------------------------------------
  static const String _rawAbi = r'''
[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" }
    ],
    "name": "NFTCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "NFTListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }
    ],
    "name": "NFTSale",
    "type": "event"
  },

  {
    "inputs": [
      { "internalType": "string", "name": "tokenURI", "type": "string" },
      { "internalType": "string", "name": "name_", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "mediaURI", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "createNFT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  {
    "inputs": [],
    "name": "getActiveListings",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "bool", "name": "isListed", "type": "bool" }
        ],
        "internalType": "struct NFTMarketplace.Listing[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "getNFT",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "mediaURI", "type": "string" }
        ],
        "internalType": "struct NFTMarketplace.NFTMetadata",
        "name": "",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "bool", "name": "isListed", "type": "bool" }
        ],
        "internalType": "struct NFTMarketplace.Listing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },

  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
]
  ''';

  // ------------------------------------------------------
  Future<void> _ensureContract() async {
    if (_contract != null) return;

    await _web3.init();

    final contractAddress =
        EthereumAddress.fromHex(Environment.contractAddress);

    _contract = DeployedContract(
      ContractAbi.fromJson(_rawAbi, 'NFTMarketplace'),
      contractAddress,
    );

    _fnGetActiveListings = _contract!.function('getActiveListings');
    _fnCreateNFT = _contract!.function('createNFT');
    _fnListNFT = _contract!.function('listNFT');
    _fnBuyNFT = _contract!.function('buyNFT');
    _fnGetNFT = _contract!.function('getNFT');
    _fnOwnerOf = _contract!.function('ownerOf');
    _fnTotalSupply = _contract!.function('totalSupply');
  }

  // ------------------------------------------------------
  // 🔥 LẤY TOÀN BỘ NFT ĐANG ĐƯỢC BÁN (MARKETPLACE)
  // ------------------------------------------------------
  Future<List<Map<String, dynamic>>> fetchAllNFTsForSale() async {
    await _ensureContract();

    final listingsRaw = await getActiveListings();
    final List<Map<String, dynamic>> result = [];

    for (final listing in listingsRaw) {
      if (!(listing['isListed'] as bool)) continue;

      final int tokenId = listing['tokenId'] as int;

      final nftRaw = await _web3.client.call(
        contract: _contract!,
        function: _fnGetNFT,
        params: [BigInt.from(tokenId)],
      );

      final meta = nftRaw[0];
      final String name = meta[0] as String;
      final String description = meta[1] as String;
      final String mediaURI = meta[2] as String;

      final BigInt priceWei = listing['price'] as BigInt;

      result.add({
        'tokenId': tokenId,
        'priceWei': priceWei.toString(),
        'priceEth': _weiToEth(priceWei),
        'seller': listing['seller'],
        'name': name,
        'description': description,
        'mediaURI': mediaURI,
        'image': mediaURI,
      });
    }

    return result;
  }

  // ------------------------------------------------------
  // 🔥 LẤY NFT USER SỞ HỮU (DÙNG CHO TAB RAO BÁN)
  // ------------------------------------------------------
  Future<List<Map<String, dynamic>>> fetchOwnedNFTs(String owner) async {
    await _ensureContract();

    final List<Map<String, dynamic>> result = [];

    final totalRaw = await _web3.client.call(
      contract: _contract!,
      function: _fnTotalSupply,
      params: [],
    );
    final int maxId = (totalRaw[0] as BigInt).toInt();

    for (int id = 1; id <= maxId; id++) {
      final ownerRaw = await _web3.client.call(
        contract: _contract!,
        function: _fnOwnerOf,
        params: [BigInt.from(id)],
      );

      final String currentOwner = ownerRaw[0].toString().toLowerCase();
      if (currentOwner != owner.toLowerCase()) continue;

      final nftRaw = await _web3.client.call(
        contract: _contract!,
        function: _fnGetNFT,
        params: [BigInt.from(id)],
      );

      final meta = nftRaw[0];
      result.add({
        'tokenId': id,
        'name': meta[0],
        'description': meta[1],
        'image': meta[2],
      });
    }

    return result;
  }

  // ------------------------------------------------------
  // 🔥 TẠO NFT (TẠO + AUTO LIST)
  // ------------------------------------------------------
  Future<String> createNFT(
    String tokenURI,
    String name,
    String desc,
    String mediaURI,
    String priceWei,
  ) async {
    await _ensureContract();

    final Uint8List data = _fnCreateNFT.encodeCall([
      tokenURI,
      name,
      desc,
      mediaURI,
      BigInt.parse(priceWei),
    ]);

    final txHash = await _web3.sendTransaction(
      to: Environment.contractAddress,
      data: '0x${bytesToHex(data)}',
      value: null,
    );
    return txHash;
  }

  // ------------------------------------------------------
  // 🔥 ĐĂNG BÁN NFT
  // ------------------------------------------------------
  Future<String> listNFT(int tokenId, String priceWei) async {
    await _ensureContract();

    final Uint8List data = _fnListNFT.encodeCall([
      BigInt.from(tokenId),
      BigInt.parse(priceWei),
    ]);

    final txHash = await _web3.sendTransaction(
      to: Environment.contractAddress,
      data: '0x${bytesToHex(data)}',
      value: null,
    );
    return txHash;
  }

  /// Helper cho màn hình Rao Bán: nhập giá ETH → chuyển sang Wei rồi gọi listNFT
  Future<String> listNFTForResale(int tokenId, String priceEth) async {
    final wei = _ethToWei(priceEth);
    return listNFT(tokenId, wei.toString());
  }

  // ------------------------------------------------------
  // 🔥 MUA NFT (GỬI ĐÚNG SỐ WEI)
  // ------------------------------------------------------
  Future<String> buyNFT(int tokenId, String valueWei) async {
    await _ensureContract();

    final Uint8List data =
        _fnBuyNFT.encodeCall([BigInt.from(tokenId)]);

    final txHash = await _web3.sendTransaction(
      to: Environment.contractAddress,
      data: '0x${bytesToHex(data)}',
      value: valueWei,
    );
    return txHash;
  }

  // ------------------------------------------------------
  // RAW ACTIVE LISTINGS
  // ------------------------------------------------------
  Future<List<Map<String, dynamic>>> getActiveListings() async {
    await _ensureContract();

    final result = await _web3.client.call(
      contract: _contract!,
      function: _fnGetActiveListings,
      params: [],
    );

    if (result.isEmpty) return [];

    final List<dynamic> rawList = result[0] as List<dynamic>;

    return rawList
        .map((item) {
          final tokenId = (item[0] as BigInt).toInt();
          final price = item[1] as BigInt;
          final seller = (item[2] as EthereumAddress).hex;
          final isListed = item[3] as bool;

          return {
            'tokenId': tokenId,
            'price': price,
            'seller': seller,
            'isListed': isListed,
          };
        })
        .toList()
        .cast<Map<String, dynamic>>();
  }

  // ------------------------------------------------------
  // 🔥 LỊCH SỬ GIAO DỊCH (TẠM THỜI: TRẢ VỀ RỖNG CHO TAB HISTORY)
  // ------------------------------------------------------
  Future<List<Map<String, dynamic>>> fetchHistory(String address) async {
    // TODO: Nếu muốn giống web React (đọc NFTSale / NFTListed events),
    // thì phải dùng getLogs + decode topics. Việc này hơi dài,
    // nên để báo cáo mobile chạy ổn, ta cho trả về list rỗng.
    return <Map<String, dynamic>>[];
  }

  // ------------------------------------------------------
  // UTILS
  // ------------------------------------------------------
  String _weiToEth(BigInt wei) {
    final double eth = wei.toDouble() / 1e18;
    return eth.toStringAsFixed(6);
  }

  BigInt _ethToWei(String ethStr) {
    final parts = ethStr.split('.');
    final whole = BigInt.parse(parts[0].isEmpty ? '0' : parts[0]);
    BigInt frac = BigInt.zero;

    if (parts.length > 1) {
      final decimals = parts[1].padRight(18, '0').substring(0, 18);
      frac = BigInt.parse(decimals);
    }

    return whole * BigInt.from(10).pow(18) + frac;
  }
}
