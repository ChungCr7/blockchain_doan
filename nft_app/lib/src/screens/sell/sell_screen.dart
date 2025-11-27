import 'package:flutter/material.dart';
import 'package:nft_app/src/services/contract_service.dart';

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

  Future<void> _loadOwned() async {
    setState(() {
      _loading = true;
      _error = false;
    });

    try {
      final result = await ContractService().fetchOwnedNFTs(widget.address);

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
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Lỗi tải NFT: $e')));
      }
    }
  }

  Future<void> _onRefresh() async => _loadOwned();

  void _showSellDialog(Map<String, dynamic> nft) {
    final TextEditingController priceCtl = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
          keyboardType:
              const TextInputType.numberWithOptions(decimal: true),
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
                  const SnackBar(content: Text('Vui lòng nhập giá')),
                );
                return;
              }

              Navigator.pop(context);

              try {
                final tx = await ContractService().listNFTForResale(
                  nft['tokenId'],
                  raw,
                );

                if (!mounted) return;

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Đã đăng bán NFT\nTX: $tx')),
                );

                _loadOwned();
              } catch (e) {
                debugPrint('[SellNFTPage] error: $e');
                if (!mounted) return;

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Lỗi đăng bán: $e')),
                );
              }
            },
            child: const Text('Đăng bán'),
          ),
        ],
      ),
    );
  }

  Widget _buildNFTItem(Map<String, dynamic> nft) {
    final img = nft['mediaURI'] ?? nft['image'];
    final tokenId = nft['tokenId'];

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 3,
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: img != null
              ? Image.network(
                  img,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      const Icon(Icons.broken_image, size: 32),
                )
              : const Icon(Icons.image, size: 32),
        ),
        title: Text(
          nft['name'] ?? 'NFT #$tokenId',
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
        subtitle: const Text(
          'Nhấn để đăng bán lại',
          style: TextStyle(color: Colors.grey),
        ),
        onTap: () => _showSellDialog(nft),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rao bán NFT'),
        elevation: 1,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Không thể tải NFT của bạn'),
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
                        itemCount: _owned.length,
                        itemBuilder: (_, i) => _buildNFTItem(_owned[i]),
                      ),
                    ),
    );
  }
}
