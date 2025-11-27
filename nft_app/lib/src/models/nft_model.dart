class NFTModel {
  final int tokenId;
  final String name;
  final String description;
  final String media;
  final String type;
  final String seller;
  final String price;

  NFTModel({
    required this.tokenId,
    required this.name,
    required this.description,
    required this.media,
    required this.type,
    required this.seller,
    required this.price,
  });
}
