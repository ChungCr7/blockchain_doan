import 'package:flutter/material.dart';
import 'package:nft_app/src/services/contract_service.dart';
import 'package:nft_app/src/services/web3_service.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  bool _loading = true;
  bool _error = false;
  List<Map<String, dynamic>> _items = [];
  String? _currentAddress;

  @override
  void initState() {
    super.initState();
    _initAndLoad();
  }

  Future<void> _initAndLoad() async {
    try {
      final ws = Web3Service();
      final addr = await ws.getCurrentAddress();
      setState(() => _currentAddress = addr);
      await _loadHistory();
    } catch (e) {
      debugPrint('[HistoryPage] init error: $e');
      setState(() {
        _loading = false;
        _error = true;
      });
    }
  }

  Future<void> _loadHistory() async {
    if (_currentAddress == null) {
      setState(() {
        _loading = false;
        _error = true;
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = false;
    });

    try {
      final result = await ContractService().fetchHistory(_currentAddress!);

      setState(() {
        _items = List<Map<String, dynamic>>.from(result);
        _loading = false;
      });
    } catch (e) {
      debugPrint('[HistoryPage] loadHistory error: $e');
      if (!mounted) return;

      setState(() {
        _loading = false;
        _error = true;
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Lỗi tải lịch sử: $e')));
    }
  }

  Future<void> _onRefresh() async => _loadHistory();

  String _formatPrice(BigInt? wei) {
    if (wei == null) return "0";
    double eth = wei.toDouble() / 1e18;
    return eth.toStringAsFixed(4);
  }

  String _formatTime(int ts) {
    final dt = DateTime.fromMillisecondsSinceEpoch(ts * 1000);
    return "${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}";
  }

  Widget _buildItem(Map<String, dynamic> item) {
    final tokenId = item["tokenId"];
    final name = item["name"] ?? "NFT #$tokenId";
    final role = item["role"] ?? "BUY";
    final price = _formatPrice(item["priceWei"]);
    final cp = item["counterparty"];
    final ts = item["timestamp"];

    final isBuy = role == "BUY";

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      child: ListTile(
        leading: Icon(
          isBuy ? Icons.call_received : Icons.call_made,
          color: isBuy ? Colors.green : Colors.orange,
          size: 28,
        ),
        title: Text(
          "${isBuy ? 'Mua' : 'Bán'} $name",
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Giá: $price ETH"),
            if (cp != null) Text("Đối tác: $cp"),
            if (ts != null) Text("Thời gian: ${_formatTime(ts)}"),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch sử giao dịch')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error
              ? Center(
                  child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text("Không tải được lịch sử"),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: _loadHistory,
                      child: const Text("Thử lại"),
                    )
                  ],
                ))
              : _items.isEmpty
                  ? RefreshIndicator(
                      onRefresh: _onRefresh,
                      child: ListView(
                        children: const [
                          SizedBox(height: 50),
                          Center(
                              child: Text("Chưa có giao dịch nào",
                                  style: TextStyle(fontSize: 16))),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _onRefresh,
                      child: ListView.builder(
                        itemCount: _items.length,
                        itemBuilder: (_, i) => _buildItem(_items[i]),
                      ),
                    ),
    );
  }
}
