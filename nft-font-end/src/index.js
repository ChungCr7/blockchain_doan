import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 👉 Thêm dòng này để import WalletProvider
import { WalletProvider } from './context/WalletContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
);

// Nếu bạn muốn đo hiệu suất ứng dụng
reportWebVitals();
