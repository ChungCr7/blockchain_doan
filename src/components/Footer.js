import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-yellow-400">
                NFT Market
              </span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase">Về chúng tôi</h2>
              <ul className="text-gray-400 text-sm">
                <li className="mb-2"><a href="/about" className="hover:underline">Thông tin thêm</a></li>
                <li className="mb-2"><a href="/careers" className="hover:underline">Cơ hội nghề nghiệp</a></li>
                <li><a href="/privacy" className="hover:underline">Riêng tư</a></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase">Sản phẩm</h2>
              <ul className="text-gray-400 text-sm">
                <li className="mb-2"><a href="/products" className="hover:underline">NFT</a></li>
                <li className="mb-2"><a href="/create" className="hover:underline">Tạo NFT</a></li>
                <li><a href="/market" className="hover:underline">Thị trường</a></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase">Hỗ trợ</h2>
              <ul className="text-gray-400 text-sm">
                <li className="mb-2"><a href="/support" className="hover:underline">Trung tâm trợ giúp</a></li>
                <li className="mb-2"><a href="/feedback" className="hover:underline">Gửi phản hồi</a></li>
                <li><a href="/contact" className="hover:underline">Liên hệ</a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400">
            © {new Date().getFullYear()} NFT Market™. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:mt-0 gap-4">
            <a href="https://facebook.com" className="text-gray-400 hover:text-white" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" className="text-gray-400 hover:text-white" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://github.com" className="text-gray-400 hover:text-white" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;