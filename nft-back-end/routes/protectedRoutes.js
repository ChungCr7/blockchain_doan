const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Đây là thông tin người dùng đã xác thực",
    userId: req.user.userId,
  });
});

module.exports = router;
