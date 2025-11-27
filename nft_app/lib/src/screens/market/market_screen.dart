import 'package:flutter/material.dart';

class MarketPage extends StatefulWidget {
  const MarketPage({super.key});

  @override
  State<MarketPage> createState() => _MarketPageState();
}

class _MarketPageState extends State<MarketPage> {
  bool loading = true;
  bool error = false;

  // Mock data để thiết kế giao diện – sau này thay bằng fetchAllNFTsForSale()
  List<Map<String, dynamic>> items = [
    {
      "name": "Cyber Dog",
      "price": "0.015",
      "image":
          "https://i.seadn.io/gae/2Jp_7Xc5v5uPUJg7YH4jPzZJMmRCxH8V4ySEH4xQDl4P4w?w=500&auto=format",
    },
    {
      "name": "Pixel Warrior",
      "price": "0.030",
      "image":
          "https://i.seadn.io/gae/1H5TpyvYYQcbmF3bE-R9f7DmqH6ybT9Eo2jjCddMjuvKc?w=500&auto=format",
    },
    {
      "name": "Neon Girl",
      "price": "0.022",
      "image":
          "https://i.seadn.io/gae/oeuN9E9Tj2yMwG3G2s1Y7lZ3Ru7k8_QfIs79y1uZB6MjE?w=500&auto=format",
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadMockData();
  }

  Future<void> _loadMockData() async {
    await Future.delayed(const Duration(milliseconds: 800));
    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0E21),
      appBar: AppBar(
        title: const Text(
          "Thị trường NFT",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF0D0E21),
        elevation: 0,
      ),

      body: loading
          ? const Center(
              child: CircularProgressIndicator(color: Colors.blueAccent),
            )
          : error
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    "Không tải được dữ liệu!",
                    style: TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _loadMockData,
                    child: const Text("Thử lại"),
                  ),
                ],
              ),
            )
          : items.isEmpty
          ? const Center(
              child: Text(
                "Chưa có NFT nào được rao bán",
                style: TextStyle(fontSize: 16),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (_, i) {
                final nft = items[i];
                return _buildNFTCard(nft);
              },
            ),
    );
  }

  Widget _buildNFTCard(Map<String, dynamic> nft) {
    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1C2C),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 8),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {},
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // IMAGE
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: Image.network(
                nft["image"],
                height: 220,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 220,
                  color: Colors.grey.shade800,
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.broken_image,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // NFT NAME
                  Text(
                    nft["name"],
                    style: const TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 6),

                  // PRICE
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "${nft["price"]} ETH",
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.blueAccent,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 10,
                          ),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Tính năng mua sẽ được triển khai"),
                            ),
                          );
                        },
                        child: const Text(
                          "Mua ngay",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
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
