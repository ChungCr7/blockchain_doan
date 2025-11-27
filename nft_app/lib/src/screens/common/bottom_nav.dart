import 'package:flutter/material.dart';
import 'package:nft_app/src/screens/create/create_screen.dart';
import 'package:nft_app/src/screens/products/products_screen.dart';
import 'package:nft_app/src/screens/sell/sell_screen.dart';
import 'package:nft_app/src/screens/history/history_screen.dart';
import 'package:nft_app/src/screens/home/home_screen.dart';

class BottomNavPage extends StatefulWidget {
  final String address; // ví đang đăng nhập

  const BottomNavPage({super.key, required this.address});

  @override
  State<BottomNavPage> createState() => _BottomNavPageState();
}

class _BottomNavPageState extends State<BottomNavPage> {
  int selected = 0;

  late final List<Widget> screens;

  @override
  void initState() {
    super.initState();

    screens = [
      HomeScreen(address: widget.address),

      /// Tạo NFT
      CreateNFTPage(address: widget.address),

      /// Rao bán NFT (NFT mình sở hữu)
      SellNFTPage(address: widget.address),

      /// Sản phẩm toàn bộ marketplace
      ProductsPage(currentAddress: widget.address),

      /// Lịch sử – không cần address
      const HistoryPage(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: screens[selected],

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: selected,
        onTap: (i) => setState(() => selected = i),

        backgroundColor: const Color(0xFF0D0E21),
        selectedItemColor: Colors.blueAccent,
        unselectedItemColor: Colors.white70,
        type: BottomNavigationBarType.fixed,

        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: "Trang chủ",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.rocket_launch),
            label: "Tạo NFT",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.sell),
            label: "Rao bán",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: "Sản phẩm",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: "Lịch sử",
          ),
        ],
      ),
    );
  }
}
