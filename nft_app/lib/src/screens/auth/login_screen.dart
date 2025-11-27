import 'package:flutter/material.dart';
import 'package:nft_app/src/services/web3_service.dart';
import 'package:nft_app/src/screens/common/bottom_nav.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool loading = false;

  Future<void> loginWallet() async {
    setState(() => loading = true);

    try {
      final ws = Web3Service();
      final address = await ws.connect();
      setState(() => loading = false);

      if (address.isNotEmpty && mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => BottomNavPage(address: address)),
        );
        return;
      }
    } catch (e) {
      debugPrint('[Login] connect error: $e');
    }

    if (mounted) {
      setState(() => loading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Kết nối ví thất bại")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0E21),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(26),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                /// LOGO APP
                Image.asset(
                  "assets/logo.png",
                  height: 120,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.account_balance_wallet,
                    size: 120,
                    color: Colors.white24,
                  ),
                ),

                const SizedBox(height: 20),

                const Text(
                  "NFT MARKETPLACE",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 10),
                const Text(
                  "Kết nối Trust Wallet để bắt đầu giao dịch NFT.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70),
                ),

                const SizedBox(height: 40),

                /// 🔵 TRUST WALLET LOGIN BUTTON
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: loading ? null : loginWallet,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueAccent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: loading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.asset(
                                "assets/trust.png",
                                height: 28,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.account_balance_wallet,
                                  color: Colors.white,
                                  size: 28,
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                "Đăng nhập bằng Trust Wallet",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
