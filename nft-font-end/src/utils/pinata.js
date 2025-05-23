import axios from 'axios';

const API_KEY = '0cdab26778a78d85731a';
const API_SECRET = 'ac016c8f3b1a1dd4f816ff541db5f465152d8119dc3789d07a65b129999f1846'; // lấy từ Pinata dashboard

const PINATA_BASE_URL = 'https://api.pinata.cloud/pinning';

export const uploadFileToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, formData, {
      maxBodyLength: "Infinity",
      headers: {
        'Content-Type': `multipart/form-data`,
        pinata_api_key: API_KEY,
        pinata_secret_api_key: API_SECRET,
      },
    });

    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

export const uploadJSONToIPFS = async (json) => {
  try {
    const res = await axios.post(`${PINATA_BASE_URL}/pinJSONToIPFS`, json, {
      headers: {
        pinata_api_key: API_KEY,
        pinata_secret_api_key: API_SECRET,
      },
    });

    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error('JSON upload failed:', error);
    throw error;
  }
};
