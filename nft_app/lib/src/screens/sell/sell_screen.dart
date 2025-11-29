import 'package:flutter/material.dart';
import 'package:nft_app/src/services/contract_service.dart';
import 'package:nft_app/src/services/ipfs_helper.dart';

class SellNFTPage extends StatefulWidget {
  final String address;

  const SellNFTPage({super.key, required this.address});

  @override
  State<SellNFTPage> createState() => _SellNFTPageState();
}

class _SellNFTPageState extends State<SellNFTPage> {
  bool _loading = true;
  bool _error = false;
  List<Map<String, dynamic>> _owned = [];

  @override
  void initState() {
    super.initState();
    _loadOwned();
  }

  // -----------------------------
  // LOAD NFTs người dùng đang sở hữu
  // -----------------------------
  Future<void> _loadOwned() async {
    setState(() {
      _loading = true;
      _error = false;
    });

    try {
      final result = await ContractService().fetchOwnedNFTs(widget.address);

      // Resolve IPFS → HTTP
      for (var n in result) {
        final img = n["mediaURI"] ?? n["image"];
        if (img != null) {
          n["resolvedImage"] = await IpfsHelper.resolve(img);
        }
      }

      setState(() {
        _owned = List<Map<String, dynamic>>.from(result);
        _loading = false;
      });
    } catch (e) {
      debugPrint('[SellNFTPage] loadOwned error: $e');
      if (mounted) {
        setState(() {
          _loading = false;
          _error = true;
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải NFT: $e')));
      }
    }
  }

  Future<void> _onRefresh() async => _loadOwned();

  // -----------------------------
  // DIALOG NHẬP GIÁ
  // -----------------------------
  void _showSellDialog(Map<String, dynamic> nft) {
    final TextEditingController priceCtl = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: Text(
          'Đăng bán: ${nft['name'] ?? 'NFT #${nft['tokenId']}'}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        content: TextField(
          controller: priceCtl,
          decoration: const InputDecoration(
            labelText: 'Giá bán (ETH)',
            hintText: 'VD: 0.02',
            border: OutlineInputBorder(),
          ),
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () async {
              final raw = priceCtl.text.trim();

              if (raw.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Vui lòng nhập giá bán')),
                );
                return;
              }

              // Convert ETH → Wei
              BigInt? priceWei;
              try {
                final eth = double.parse(raw);
                priceWei = BigInt.from(eth * 1e18);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Giá không hợp lệ')),
                );
                return;
              }

              Navigator.pop(context);

              try {
                final tx = await ContractService().listNFTForResale(
                  nft['tokenId'],
                  priceWei.toString(),
                );

                if (!mounted) return;

                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text('Đã đăng bán\nTX: $tx')));

                _loadOwned();
              } catch (e) {
                debugPrint('[SellNFTPage] error: $e');
                if (!mounted) return;

                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text('Lỗi đăng bán: $e')));
              }
            },
            child: const Text('Đăng bán'),
          ),
        ],
      ),
    );
  }

  // -----------------------------
  // BUILD NFT ITEM
  // -----------------------------
  Widget _buildNFTItem(Map<String, dynamic> nft) {
    final img = nft['resolvedImage'] ?? nft['mediaURI'] ?? nft['image'];
    final tokenId = nft['tokenId'];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1C2C),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 6),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(14),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: img != null
              ? Image.network(
                  img,
                  width: 65,
                  height: 65,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.broken_image,
                    size: 32,
                    color: Colors.white,
                  ),
                )
              : const Icon(Icons.image, size: 32, color: Colors.white),
        ),
        title: Text(
          nft['name'] ?? 'NFT #$tokenId',
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 17,
            color: Colors.white,
          ),
        ),
        subtitle: const Text(
          'Nhấn để đăng bán lại',
          style: TextStyle(color: Colors.grey),
        ),

        trailing: const Icon(Icons.sell, color: Colors.blueAccent),

        onTap: () => _showSellDialog(nft),
      ),
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0E21),
      appBar: AppBar(
        title: const Text('Rao bán NFT'),
        backgroundColor: const Color(0xFF0D0E21),
        elevation: 0,
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: Colors.blueAccent),
            )
          : _error
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Không thể tải NFT của bạn',
                    style: TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: _loadOwned,
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            )
          : _owned.isEmpty
          ? RefreshIndicator(
              onRefresh: _onRefresh,
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: const [
                  SizedBox(height: 50),
                  Center(
                    child: Text(
                      'Bạn chưa sở hữu NFT nào.\nHãy thử mua hoặc tạo NFT.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _onRefresh,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _owned.length,
                itemBuilder: (_, i) => _buildNFTItem(_owned[i]),
              ),
            ),
    );
  }
}
