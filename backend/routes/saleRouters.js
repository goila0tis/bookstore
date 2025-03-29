const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {statistical} = require("../controllers/orderController");

router.get("/", protect, statistical);

module.exports = router;