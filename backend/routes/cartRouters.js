const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { addToCart, changeQuantity, getCart } = require("../controllers/cartController");

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/changeQuantity", protect, changeQuantity);

module.exports = router;