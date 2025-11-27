// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @dev Simple NFT marketplace to mint, list, buy, update and cancel NFTs
 */
contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public feePercentage = 250; // 2.5%
    uint256 public feeCollected;

    // FIXED constructor
    constructor() ERC721("MyNFT", "MNFT") Ownable() {}

    struct Listing {
        uint256 tokenId;
        uint256 price;
        address seller;
        bool isListed;
    }

    struct NFTMetadata {
        string name;
        string description;
        string mediaURI;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => NFTMetadata) public nftMetadata;

    // EVENTS
    event NFTCreated(uint256 indexed tokenId, address indexed creator);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTListingUpdated(uint256 indexed tokenId, uint256 newPrice);
    event NFTSaleCancelled(uint256 indexed tokenId, address indexed seller);
    event NFTSale(uint256 indexed tokenId, address indexed buyer, uint256 price, uint256 fee);

    // CREATE NFT + AUTO LIST
    function createNFT(
        string memory tokenURI,
        string memory name_,
        string memory description,
        string memory mediaURI,
        uint256 price
    ) public returns (uint256) {
        require(price > 0, "Price must be above zero");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        nftMetadata[newTokenId] = NFTMetadata({
            name: name_,
            description: description,
            mediaURI: mediaURI
        });

        listings[newTokenId] = Listing({
            tokenId: newTokenId,
            price: price,
            seller: msg.sender,
            isListed: true
        });

        emit NFTCreated(newTokenId, msg.sender);
        emit NFTListed(newTokenId, msg.sender, price);

        return newTokenId;
    }

    // LIST NFT
    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can list");
        require(price > 0, "Price must be above zero");

        listings[tokenId] = Listing({
            tokenId: tokenId,
            price: price,
            seller: msg.sender,
            isListed: true
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    // CANCEL LISTING
    function cancelListing(uint256 tokenId) public {
        Listing memory item = listings[tokenId];
        require(item.isListed, "NFT is not listed");
        require(item.seller == msg.sender, "Only seller can cancel");

        listings[tokenId].isListed = false;
        emit NFTSaleCancelled(tokenId, msg.sender);
    }

    // UPDATE PRICE
    function updateListing(uint256 tokenId, uint256 newPrice) public {
        Listing storage item = listings[tokenId];
        require(item.isListed, "NFT is not listed");
        require(item.seller == msg.sender, "Only seller can update");
        require(newPrice > 0, "Price must be above zero");

        item.price = newPrice;
        emit NFTListingUpdated(tokenId, newPrice);
    }

    // BUY NFT
    function buyNFT(uint256 tokenId) public payable nonReentrant {
        Listing memory item = listings[tokenId];
        require(item.isListed, "NFT not listed");
        require(msg.value >= item.price, "Not enough ETH");
        require(item.seller != msg.sender, "Seller cannot buy");

        uint256 fee = (item.price * feePercentage) / 10000;
        uint256 sellerProceeds = item.price - fee;

        _transfer(item.seller, msg.sender, tokenId);
        payable(item.seller).transfer(sellerProceeds);
        feeCollected += fee;

        if (msg.value > item.price) {
            payable(msg.sender).transfer(msg.value - item.price);
        }

        listings[tokenId].isListed = false;
        emit NFTSale(tokenId, msg.sender, item.price, fee);
    }

    // WITHDRAW FEES
    function withdrawFees() public onlyOwner {
        uint256 amount = feeCollected;
        feeCollected = 0;
        payable(owner()).transfer(amount);
    }

    // GET ACTIVE LISTINGS
    function getActiveListings() public view returns (Listing[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256 count = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (listings[i].isListed) {
                count++;
            }
        }

        Listing[] memory activeListings = new Listing[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (listings[i].isListed) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }

    // GET NFT DETAILS
    function getNFT(uint256 tokenId)
        public
        view
        returns (NFTMetadata memory, Listing memory)
    {
        return (nftMetadata[tokenId], listings[tokenId]);
    }

    // TOTAL SUPPLY
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    // UPDATE FEE
    function setFeePercentage(uint256 newFee) public onlyOwner {
        require(newFee <= 1000, "Fee too high (max 10%)");
        feePercentage = newFee;
    }
}
