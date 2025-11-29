import 'package:flutter/material.dart';
import 'package:nft_app/src/services/contract_service.dart';
import 'package:nft_app/src/services/ipfs_helper.dart';

class NFTDetailPage extends StatefulWidget {
  final Map<String, dynamic> nft;
  final String currentAddress;

  const NFTDetailPage({
    super.key,
    required this.nft,
    required this.currentAddress,
  });

  @override
  State<NFTDetailPage> createState() => _NFTDetailPageState();
}

class _NFTDetailPageState extends State<NFTDetailPage> {
  bool _buying = false;
  String? resolvedImage;

  @override
  void initState() {
    super.initState();
    _resolveImage();
  }

  Future<void> _resolveImage() async {
    final media = widget.nft["mediaURI"] ?? widget.nft["image"];
    if (media == null) return;

    final link = await IpfsHelper.resolve(media);
    setState(() => resolvedImage = link);
  }

  String _formatEth(BigInt? wei) {
    if (wei == null) return "0";
    final eth = wei.toDouble() / 1e18;
    return eth.toStringAsFixed(4);
  }

  Future<void> _buy() async {
    final tokenId = widget.nft["tokenId"];
    final priceWei = widget.nft["priceWei"]?.toString();

    if (tokenId == null || priceWei == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Không xác định được tokenId hoặc giá")),
      );
      return;
    }

    setState(() => _buying = true);

    try {
      final tx = await ContractService().buyNFT(tokenId, priceWei);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Mua thành công – TX: $tx")),
      );

      Navigator.pop(context, true);
    } catch (e) {
      debugPrint("[NFTDetailPage] buyNFT error: $e");
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Lỗi mua NFT: $e")),
      );
    } finally {
      if (mounted) setState(() => _buying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final nft = widget.nft;

    final media = resolvedImage ?? nft["mediaURI"] ?? nft["image"];
    final name = nft["name"] ?? "NFT";
    final desc = nft["description"] ?? "Không có mô tả";

    final seller = nft["seller"];

    final priceWei = nft["priceWei"] is BigInt
        ? nft["priceWei"]
        : BigInt.tryParse(nft["priceWei"]?.toString() ?? "");

    final priceDisplay = _formatEth(priceWei);

    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: media != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        media,
                        width: 260,
                        height: 260,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            const Icon(Icons.broken_image, size: 120),
                      ),
                    )
                  : const Icon(Icons.image, size: 120),
            ),
            const SizedBox(height: 20),

            Text(
              name,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            Text(desc, style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 20),

            Text(
              "Giá: $priceDisplay ETH",
              style: const TextStyle(
                fontSize: 22,
                color: Colors.blueAccent,
                fontWeight: FontWeight.bold,
              ),
            ),

            if (seller != null) ...[
              const SizedBox(height: 8),
              Text(
                "Người bán: $seller",
                style: const TextStyle(color: Colors.grey),
              ),
            ],

            const Spacer(),

            /// BUY BUTTON
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _buying ? null : _buy,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _buying
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Mua ngay"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
