const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

    // ✅ Băm mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "Đăng ký thành công", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi đăng ký", error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Login request received"); // Không log email và mật khẩu

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User không tồn tại");
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Sai mật khẩu");
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
  }
};

