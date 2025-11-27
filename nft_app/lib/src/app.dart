import 'package:flutter/material.dart';
import 'package:nft_app/src/screens/auth/login_screen.dart' as old_login;
import 'package:nft_app/src/screens/home/home_screen.dart' as old_home;
import 'package:nft_app/src/screens/market/market_screen.dart' as old_market;
import 'package:nft_app/src/screens/create/create_screen.dart' as old_create;
import 'package:nft_app/src/screens/products/products_screen.dart'
    as old_products;

/// Lightweight App wrapper providing named routes.
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NFT Mobile App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0D0E21),
        primaryColor: Colors.yellow[700],
      ),
      initialRoute: '/login',
      routes: {
        '/login': (_) => const old_login.LoginScreen(),
        '/home': (ctx) => old_home.HomePage(address: '', balance: null),
        '/market': (_) => const old_market.MarketPage(),
        '/create': (ctx) => old_create.CreateNFTPage(address: ''),
        '/products': (_) => const old_products.ProductsPage(),
        '/collection': (_) => const SizedBox.shrink(),
      },
    );
  }
}
