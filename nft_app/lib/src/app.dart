import 'package:flutter/material.dart';
import 'package:nft_app/src/screens/auth/login_screen.dart';
import 'package:nft_app/src/screens/home/home_screen.dart';
import 'package:nft_app/src/screens/create/create_screen.dart';
import 'package:nft_app/src/screens/products/products_screen.dart';

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
        '/login': (_) => const LoginScreen(),

        // 👇 Home nhận address qua arguments
        '/home': (ctx) {
          final args =
              ModalRoute.of(ctx)!.settings.arguments as Map<String, dynamic>;
          return HomeScreen(address: args['address']);
        },

        // 👇 Tạo NFT
        '/create': (ctx) {
          final args =
              ModalRoute.of(ctx)!.settings.arguments as Map<String, dynamic>;
          return CreateNFTPage(address: args['address']);
        },

        // 👇 Products
        '/products': (ctx) {
          final args =
              ModalRoute.of(ctx)!.settings.arguments as Map<String, dynamic>;
          return ProductsPage(currentAddress: args['address']);
        },
      },
    );
  }
}
