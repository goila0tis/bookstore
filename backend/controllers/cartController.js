const asyncHandler = require("express-async-handler");
const cartModel = require("../models/cartModel");

const getCart = asyncHandler(async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user._id }).populate("cartItems.book").exec();
    console.log(cart);
    
    if (cart) {
      res.json({ cart });
    } else {
      res.json({ cart: { cartItems: [] } });
    }
    
  } catch (error) {
    console.log(error);
    
  }
});
const addToCart = asyncHandler(async (req, res) => {
    const { id, qty } = req.body;
    const cart = await cartModel.findOne({ user: req.user._id });
    if (cart) {
      const bookExists = cart.cartItems.find((x) => x.book == id);
      if (bookExists) {
        bookExists.qty += qty;
      } else {
        cart.cartItems.push({ book: id, qty });
      }
      await cart.save();
      res.json(cart);
    } else {
      
      const cart = await cartModel.create({
        user: req.user._id,
        cartItems: [{ book: id, qty }],
      });
      res.status(201).json(cart);
    }
});
const changeQuantity = asyncHandler(async (req, res) => {
  const { book, qty } = req.body;
  const cart = await cartModel.findOne({ user: req.user._id });
  if (cart) {
    const bookExists = cart.cartItems.find((x) => x.book == book);
    if (bookExists) {
      bookExists.qty = qty;
    }
    await cart.save();
    res.json(cart);
  } else {
    res.status(404);
    throw new Error("Cart not found");
  }
});
module.exports = { getCart, addToCart, changeQuantity };
