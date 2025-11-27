import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:nft_app/src/services/pinata_service.dart';
import 'package:nft_app/src/services/contract_service.dart';

class CreateNFTPage extends StatefulWidget {
  final String address;

  const CreateNFTPage({super.key, required this.address});

  @override
  State<CreateNFTPage> createState() => _CreateNFTPageState();
}

class _CreateNFTPageState extends State<CreateNFTPage> {
  final _nameCtl = TextEditingController();
  final _descCtl = TextEditingController();
  final _priceCtl = TextEditingController();

  File? _mediaFile;
  String? _mediaType;

  bool _loading = false;

  @override
  void dispose() {
    _nameCtl.dispose();
    _descCtl.dispose();
    _priceCtl.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------
  // PICK FILE
  // ---------------------------------------------------------
  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: [
        'jpg', 'jpeg', 'png', 'gif',
        'mp4', 'mov', 'webm',
        'mp3'
      ],
    );

    if (result == null) return;
    final path = result.files.single.path;
    if (path == null) return;

    setState(() {
      _mediaFile = File(path);

      final ext = path.split('.').last.toLowerCase();
      if (['mp3'].contains(ext)) {
        _mediaType = "audio";
      } else if (['mp4', 'mov', 'webm'].contains(ext)) {
        _mediaType = "video";
      } else {
        _mediaType = "image";
      }
    });
  }

  // ---------------------------------------------------------
  // ETH → WEI
  // ---------------------------------------------------------
  String _ethToWeiString(String eth) {
    final parts = eth.split('.');
    final whole = BigInt.parse(parts[0]);

    BigInt frac = BigInt.zero;
    if (parts.length > 1) {
      final decimals = parts[1].padRight(18, '0').substring(0, 18);
      frac = BigInt.parse(decimals);
    }

    return (whole * BigInt.from(10).pow(18) + frac).toString();
  }

  // ---------------------------------------------------------
  // CREATE NFT
  // ---------------------------------------------------------
  Future<void> _createNFT() async {
    final name = _nameCtl.text.trim();
    final desc = _descCtl.text.trim();
    final price = _priceCtl.text.trim();

    if (name.isEmpty || desc.isEmpty || _mediaFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Vui lòng nhập đầy đủ thông tin")),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      // 1) Upload file lên Pinata
      final mediaUri = await PinataService.uploadFile(_mediaFile!);

      // 2) Upload metadata JSON lên Pinata
      final metadata = {
        "name": name,
        "description": desc,
        "mediaURI": mediaUri,
        "type": _mediaType ?? "image",
      };

      final tokenUri = await PinataService.uploadJson(metadata);

      // 3) Convert ETH → WEI
      final weiPrice = price.isEmpty ? "0" : _ethToWeiString(price);

      // 4) Gọi contract createNFT
      final txHash = await ContractService().createNFT(
        tokenUri,
        name,
        desc,
        mediaUri,
        weiPrice,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Tạo NFT thành công\nTX: $txHash")),
      );

      // Reset form sau khi tạo
      _nameCtl.clear();
      _descCtl.clear();
      _priceCtl.clear();

      setState(() {
        _mediaFile = null;
        _mediaType = null;
      });
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Lỗi tạo NFT: $e")),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Tạo NFT")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Tạo NFT mới",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text("Wallet: ${widget.address}", style: const TextStyle(color: Colors.grey)),

            const SizedBox(height: 20),

            TextField(
              controller: _nameCtl,
              decoration: const InputDecoration(
                labelText: "Tên NFT",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _descCtl,
              decoration: const InputDecoration(
                labelText: "Mô tả",
                border: OutlineInputBorder(),
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _pickFile,
                  icon: const Icon(Icons.attach_file),
                  label: const Text("Chọn file"),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _mediaFile == null
                        ? "Chưa chọn file"
                        : _mediaFile!.path.split(Platform.pathSeparator).last,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            TextField(
              controller: _priceCtl,
              decoration: const InputDecoration(
                labelText: "Giá (ETH)",
                border: OutlineInputBorder(),
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _createNFT,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("🚀 Tạo NFT ngay"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
