import 'dart:typed_data';

import 'package:web3dart/web3dart.dart';
import 'package:web3dart/crypto.dart' show bytesToHex;

import 'package:nft_app/src/config/environment.dart';
import 'package:nft_app/src/services/web3_service.dart';

/// ContractService: wrapper over Web3Service to centralize contract-related calls.
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

  static const String _rawAbi = r'''
[
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"}],"name":"NFTCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"NFTListed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"NFTListingUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"NFTSale","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"}],"name":"NFTSaleCancelled","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"buyNFT","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"cancelListing","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"string","name":"tokenURI","type":"string"},{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"mediaURI","type":"string"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"createNFT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"feeCollected","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"feePercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getActiveListings","outputs":[{"components":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"bool","name":"isListed","type":"bool"}],"internalType":"struct NFTMarketplace.Listing[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getNFT","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"mediaURI","type":"string"}],"internalType":"struct NFTMarketplace.NFTMetadata","name":"","type":"tuple"},{"components":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"bool","name":"isListed","type":"bool"}],"internalType":"struct NFTMarketplace.Listing","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"listNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"listings","outputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"bool","name":"isListed","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nftMetadata","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"mediaURI","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setFeePercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"updateListing","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"}
]
''';

  Future<void> _ensureContract() async {
    if (_contract != null) return;
    await _web3.init();

    final contractAddress = EthereumAddress.fromHex(
      Environment.contractAddress,
    );
    _contract = DeployedContract(
      ContractAbi.fromJson(_rawAbi, 'NFTMarketplace'),
      contractAddress,
    );

    _fnGetActiveListings = _contract!.function('getActiveListings');
    _fnCreateNFT = _contract!.function('createNFT');
    _fnListNFT = _contract!.function('listNFT');
    _fnBuyNFT = _contract!.function('buyNFT');
  }

  Future<List<Map<String, dynamic>>> getActiveListings() async {
    await _ensureContract();
    final result = await _web3.client.call(
      contract: _contract!,
      function: _fnGetActiveListings,
      params: [],
    );

    if (result.isEmpty) return [];

    final listingsRaw = result[0] as List<dynamic>;
    final listings = <Map<String, dynamic>>[];
    for (final item in listingsRaw) {
      final tokenId = (item[0] as BigInt).toInt();
      final price = item[1] as BigInt;
      final seller = (item[2] as EthereumAddress).hex;
      final isListed = item[3] as bool;
      listings.add({
        'tokenId': tokenId,
        'price': price.toString(),
        'seller': seller,
        'isListed': isListed,
      });
    }
    return listings;
  }

  Future<String> createNFT(
    String tokenURI,
    String name,
    String description,
    String mediaURI,
    String weiPrice,
  ) async {
    await _ensureContract();

    final Uint8List data = _fnCreateNFT.encodeCall([
      tokenURI,
      name,
      description,
      mediaURI,
      BigInt.parse(weiPrice),
    ]);

    final dataHex = '0x' + bytesToHex(data, include0x: false);

    final txHash = await _web3.sendTransaction(
      to: Environment.contractAddress,
      data: dataHex,
      value: null,
    );
    return txHash;
  }

  Future<String> listNFT(int tokenId, String weiPrice) async {
    await _ensureContract();
    final Uint8List data = _fnListNFT.encodeCall([
      BigInt.from(tokenId),
      BigInt.parse(weiPrice),
    ]);
    final dataHex = '0x' + bytesToHex(data, include0x: false);
    final txHash = await _web3.sendTransaction(
      to: Environment.contractAddress,
      data: dataHex,
      value: null,
    );
    return txHash;
  }

  Future<String> buyNFT(int tokenId, {String? valueWei}) async {
    await _ensureContract();
    String valueToSend = valueWei ?? '0';
    if (valueToSend == '0') {
      final listing = await _web3.client.call(
        contract: _contract!,
        function: _contract!.function('listings'),
        params: [BigInt.from(tokenId)],
      );
      if (listing.isNotEmpty) {
        final price = listing[1] as BigInt;
        valueToSend = price.toString();
      }
    }

    final Uint8List data = _fnBuyNFT.encodeCall([BigInt.from(tokenId)]);
    final dataHex = '0x' + bytesToHex(data, include0x: false);
    final txHash = await _web3.sendTransaction(
      to: Environment.contractAddress,
      data: dataHex,
      value: valueToSend,
    );
    return txHash;
  }
}
