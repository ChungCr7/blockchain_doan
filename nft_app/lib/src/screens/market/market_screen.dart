import 'package:flutter/material.dart';
import 'package:nft_app/src/services/contract_service.dart';
import 'package:nft_app/src/services/ipfs_helper.dart';
import 'package:nft_app/src/screens/products/nft_detail_page.dart';

class MarketPage extends StatefulWidget {
  final String currentAddress;

  const MarketPage({super.key, required this.currentAddress});

  @override
  State<MarketPage> createState() => _MarketPageState();
}

class _MarketPageState extends State<MarketPage> {
  bool loading = true;
  bool error = false;

  List<Map<String, dynamic>> items = [];

  @override
  void initState() {
    super.initState();
    _loadMarket();
  }

  Future<void> _loadMarket() async {
    try {
      setState(() => loading = true);

      final result = await ContractService().fetchAllNFTsForSale();

      // Resolve IPFS images automatically
      for (var i = 0; i < result.length; i++) {
        final media = result[i]["mediaURI"] ?? result[i]["image"];
        if (media != null) {
          final resolved = await IpfsHelper.resolve(media);
          result[i]["resolvedImage"] = resolved;
        } else {
          result[i]["resolvedImage"] = null;
        }
      }

      setState(() {
        items = result;
        loading = false;
      });
    } catch (e) {
      debugPrint("[MarketPage] Load error: $e");

      setState(() {
        error = true;
        loading = false;
      });
    }
  }

  String _formatEth(dynamic wei) {
    try {
      if (wei is BigInt) {
        return (wei.toDouble() / 1e18).toStringAsFixed(4);
      }
      if (wei is String) {
        final p = BigInt.tryParse(wei);
        if (p != null) return (p.toDouble() / 1e18).toStringAsFixed(4);
      }
    } catch (_) {}
    return "0";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0E21),
      appBar: AppBar(
        title: const Text(
          "Thị trường NFT",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF0D0E21),
        elevation: 0,
      ),

      body: loading
          ? const Center(
              child: CircularProgressIndicator(color: Colors.blueAccent),
            )
          : error
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    "Không tải được dữ liệu!",
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _loadMarket,
                    child: const Text("Thử lại"),
                  ),
                ],
              ),
            )
          : items.isEmpty
          ? const Center(
              child: Text(
                "Chưa có NFT nào được rao bán",
                style: TextStyle(fontSize: 16, color: Colors.white),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (_, i) => _buildNFTCard(items[i]),
            ),
    );
  }

  Widget _buildNFTCard(Map<String, dynamic> nft) {
    final img = nft["resolvedImage"] ?? nft["mediaURI"] ?? nft["image"];
    final price = _formatEth(nft["priceWei"]);

    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1C2C),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 8),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => NFTDetailPage(
                nft: nft,
                currentAddress: widget.currentAddress,
              ),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // IMAGE
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: Image.network(
                img ?? "",
                height: 220,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 220,
                  color: Colors.grey.shade800,
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.broken_image,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // NFT NAME
                  Text(
                    nft["name"] ?? "No Name",
                    style: const TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 6),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "$price ETH",
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.blueAccent,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 10,
                          ),
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => NFTDetailPage(
                                nft: nft,
                                currentAddress: widget.currentAddress,
                              ),
                            ),
                          );
                        },
                        child: const Text(
                          "Xem ngay",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
