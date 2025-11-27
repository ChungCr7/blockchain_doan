import 'package:flutter/material.dart';
import 'package:nft_app/src/services/web3_service.dart';
import 'package:nft_app/src/screens/create/create_screen.dart';
import 'package:nft_app/src/screens/market/market_screen.dart';

class HomePage extends StatelessWidget {
  final String address;
  final String? balance;

  const HomePage({super.key, required this.address, this.balance});

  Future<void> _logout(BuildContext context) async {
    try {
      final ws = Web3Service();
      await ws.disconnect(clearStoredData: true);
    } catch (e) {
      debugPrint('[HomePage] Logout error: $e');
    }
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã đăng xuất')));
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NFT Marketplace'),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        color: Colors.grey[900],
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 8),
            const Text(
              '🪙 Chào mừng đến với NFT Marketplace',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFFFFD54F),
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Nền tảng tạo, mua và bán NFT với trải nghiệm dễ dàng, bảo mật và minh bạch.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CreateNFTPage(address: address),
                      ),
                    );
                  },
                  icon: const Icon(Icons.rocket_launch, color: Colors.black),
                  label: const Text(
                    '🚀 Tạo NFT',
                    style: TextStyle(color: Colors.black),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFD54F),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 14,
                    ),
                    textStyle: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                const SizedBox(width: 16),
                OutlinedButton.icon(
                  onPressed: () {
                    Navigator.of(
                      context,
                    ).push(MaterialPageRoute(builder: (_) => MarketPage()));
                  },
                  icon: const Icon(Icons.search, color: Color(0xFFFFD54F)),
                  label: const Text(
                    '🔍 Khám phá thị trường',
                    style: TextStyle(color: Color(0xFFFFD54F)),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFFFD54F)),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 14,
                    ),
                    textStyle: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 36),
            Card(
              color: Colors.grey[850],
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Address',
                            style: TextStyle(color: Colors.white70),
                          ),
                          const SizedBox(height: 6),
                          SelectableText(
                            address,
                            style: const TextStyle(color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text(
                          'Balance',
                          style: TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${balance ?? "-"} ETH',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
