import 'package:flutter/material.dart';
import 'package:nft_app/src/screens/auth/login_screen.dart';
import 'package:nft_app/src/services/web3_service.dart';

class HomeScreen extends StatefulWidget {
  final String? address;

  const HomeScreen({super.key, required this.address});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _address;

  @override
  void initState() {
    super.initState();
    _address = widget.address;

    // Nếu không có địa chỉ ví → trở về Login
    if (_address == null || _address!.isEmpty) {
      _goToLogin();
    }
  }

  Future<void> _logout() async {
    try {
      final ws = Web3Service();
      await ws.disconnect(clearStoredData: true);
    } catch (_) {}

    _address = null;

    if (mounted) _goToLogin();
  }

  void _goToLogin() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_address == null || _address!.isEmpty) {
      return const SizedBox(); // tránh lỗi build
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("NFT Marketplace"),
        actions: [
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "👋 Chào mừng đến với NFT Marketplace",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              "Nền tảng NFT an toàn – minh bạch – dễ dùng.",
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 20),

            // Address Box
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade900,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Text("Address:", style: TextStyle(fontSize: 15)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _address!,
                      style: const TextStyle(
                        fontSize: 15,
                        color: Colors.yellow,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
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
