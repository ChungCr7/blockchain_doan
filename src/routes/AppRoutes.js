import axios from "axios";

const API_KEY = "YOUR_PINATA_API_KEY";
const API_SECRET = "YOUR_PINATA_SECRET";

export const uploadFileToIPFS = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append("pinataMetadata", metadata);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data`,
          pinata_api_key: API_KEY,
          pinata_secret_api_key: API_SECRET,
        },
      }
    );

    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error("Upload file thất bại:", error);
    throw error;
  }
};

export const uploadJSONToIPFS = async (json) => {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      json,
      {
        headers: {
          pinata_api_key: API_KEY,
          pinata_secret_api_key: API_SECRET,
        },
      }
    );
    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error("Upload JSON thất bại:", error);
    throw error;
  }
};
