import 'package:flutter/material.dart';
import 'package:nft_app/src/screens/products/nft_detail_page.dart';
import 'package:nft_app/src/services/contract_service.dart';
import 'package:nft_app/src/services/ipfs_helper.dart';

class ProductsPage extends StatefulWidget {
  final String currentAddress;

  const ProductsPage({super.key, required this.currentAddress});

  @override
  State<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends State<ProductsPage> {
  bool _loading = true;
  bool _error = false;
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    setState(() {
      _loading = true;
      _error = false;
    });

    try {
      final data = await ContractService().fetchAllNFTsForSale();

      // 🔥 Smart Gateway xử lý IPFS cho toàn bộ danh sách
      for (var item in data) {
        final media = item["mediaURI"] ?? item["image"];

        if (media != null) {
          final resolved = await IpfsHelper.resolve(media);
          item["mediaResolved"] = resolved;
        }
      }

      setState(() {
        _items = data;
        _loading = false;
      });
    } catch (e) {
      debugPrint("[ProductsPage] Load error: $e");

      if (!mounted) return;

      setState(() {
        _error = true;
        _loading = false;
      });

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Lỗi tải NFT: $e")));
    }
  }

  Future<void> _onRefresh() async => _loadItems();

  String _formatEth(dynamic priceWei) {
    try {
      if (priceWei is BigInt) {
        final eth = priceWei.toDouble() / 1e18;
        return eth.toStringAsFixed(4);
      } else if (priceWei is String) {
        final parsed = BigInt.tryParse(priceWei);
        if (parsed != null) {
          return (parsed.toDouble() / 1e18).toStringAsFixed(4);
        }
      }
    } catch (_) {}
    return "0";
  }

  Widget _buildItem(Map<String, dynamic> nft) {
    final media = nft["mediaResolved"] ?? nft["mediaURI"] ?? nft["image"];
    final priceWei = nft["priceWei"] ?? nft["price"];
    final priceDisplay = _formatEth(priceWei);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: media != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: Image.network(
                  media,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      const Icon(Icons.broken_image, size: 32),
                ),
              )
            : const Icon(Icons.image, size: 32),
        title: Text(
          nft["name"] ?? "Không có tên",
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          "$priceDisplay ETH",
          style: const TextStyle(color: Colors.blueAccent),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
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
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Sản phẩm")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text("Không tải được dữ liệu marketplace"),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _loadItems,
                    child: const Text("Thử lại"),
                  ),
                ],
              ),
            )
          : _items.isEmpty
          ? RefreshIndicator(
              onRefresh: _onRefresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: const [
                  SizedBox(height: 50),
                  Center(
                    child: Text(
                      "Chưa có NFT nào đang được rao bán",
                      style: TextStyle(fontSize: 16),
                    ),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _onRefresh,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _items.length,
                itemBuilder: (_, i) => _buildItem(_items[i]),
              ),
            ),
    );
  }
}
