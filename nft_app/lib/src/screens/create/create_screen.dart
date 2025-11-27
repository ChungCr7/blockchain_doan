import 'package:flutter/material.dart';

class CreateNFTPage extends StatelessWidget {
  final String address;

  const CreateNFTPage({super.key, required this.address});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tạo NFT')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tạo NFT mới',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text('Wallet: $address'),
            const SizedBox(height: 20),
            const TextField(decoration: InputDecoration(labelText: 'Tên NFT')),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(labelText: 'Mô tả'),
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Chức năng tạo NFT chưa được triển khai'),
                  ),
                );
              },
              child: const Text('Tạo'),
            ),
          ],
        ),
      ),
    );
  }
}
