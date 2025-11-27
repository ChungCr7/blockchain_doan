class Environment {
  // Production/dev values. Can be overridden via --dart-define.
  static const String rpcUrl = String.fromEnvironment(
    'RPC_URL',
    defaultValue: 'https://eth-sepolia.g.alchemy.com/v2/FkCaghR4VF2YJjv_eOzfA',
  );

  static const String walletConnectProjectId = String.fromEnvironment(
    'WALLETCONNECT_PROJECT_ID',
    defaultValue: 'c7950190937e58bbb9cf5c4e0381f56a',
  );

  static const int chainId = 11155111; // Sepolia
  static const String sepoliaChainIdHex = '0xaa36a7';
  static const String sepoliaChainName = 'Sepolia Testnet';
  static const String sepoliaChainEip155 = 'eip155:11155111';
  static const String ethereumMainnetEip155 = 'eip155:1';
  static const String sepoliaExplorerUrl = 'https://sepolia.etherscan.io';
  // Contract address from frontend constants
  static const String contractAddress = String.fromEnvironment(
    'CONTRACT_ADDRESS',
    defaultValue: '0x994EbecB94269902D99cF4b69824B78B5627f19A',
  );
}
