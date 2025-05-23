export const ipfsToHttp = (url) =>
  url?.startsWith("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url;
