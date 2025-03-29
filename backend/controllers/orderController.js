const asyncHandler = require("express-async-handler");
const { Order } = require("../models/orderModel");
const { log } = require("console");
let $ = require("jquery");
const request = require("request");
const moment = require("moment");
const bookModel = require("../models/bookModel");
const crypto = require("crypto");
const { stat } = require("fs");
function sortParams(obj) {
  const sortedObj = Object.entries(obj)
    .filter(
      ([key, value]) => value !== "" && value !== undefined && value !== null
    )
    .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return sortedObj;
}
const statistical = asyncHandler(async (req, res) => {
    const current = new Date();
    const revenueList = await Order.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(current.setDate(current.getDate() - 7)),
              }
            },
            {
              createdAt: {
                $lte: new Date() //:))
              }
            },
            {
              isPaid: true
            }
          ]
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$createdAt"
            }
          },
          revenue: {
            $sum: "$totalPrice"
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1
        }
      }
    ]);
    
    const last7DaysList = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = moment(date).format("DD-MM-YYYY");
      const revenue = revenueList.find((r) => r.date === dateStr);
      last7DaysList.push({
        date: dateStr,
        revenue: revenue ? revenue.revenue : 0
      });
    }
    last7DaysList.sort((a, b) => {
      const dateA = moment(a.date, "DD-MM-YYYY");
      const dateB = moment(b.date, "DD-MM-YYYY");
      return dateA - dateB;
    });
    res.json(last7DaysList);

});
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    console.log(orderItems);
    
    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
      return;
    } else {
      let itemsPrice = orderItems.reduce(
        (acc, item) => acc + item.book.price * item.qty,
        0
      );
      let taxPrice = 0.15 * itemsPrice;
      let shippingPrice = 0;
      let totalPrice = itemsPrice + taxPrice + shippingPrice;
      let items = orderItems.map((item) => {
        return {
          name: item.book.name,
          qty: item.qty,
          image: item.book.image,
          price: item.book.price,
          book: item.book._id,
        };
      });
      const listBookIds = items.map((item) => item.book);
      const books = await bookModel.find({ _id: { $in: listBookIds } }).select("_id countInStock");
      const checkStock = books
      .every((book) => book.countInStock >= items
      .find((item) => item.book == book._id.toString()).qty);
      console.log({checkStock});
      if (!checkStock) {
        throw new Error("Out of stock");
      }
      
      const order = new Order({
        orderItems: items,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        status: "AWAITING_PAYMENT",
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });
  
      const createdOrder = await order.save();
      process.env.TZ = "Asia/Ho_Chi_Minh";
  
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");
  
      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
  
      let config = require("config");
  
      let tmnCode = config.get("vnp_TmnCode");
      let secretKey = config.get("vnp_HashSecret");
      let vnpUrl = config.get("vnp_Url");
      let returnUrl = config.get("vnp_ReturnUrl");
      let orderId = createdOrder._id.toString();
      let amount = totalPrice;
      let bankCode = null;
  
      let locale = "vn";
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }
      const sortedParams = sortParams(vnp_Params);
      const urlParams = new URLSearchParams();
      for (let [key, value] of Object.entries(sortedParams)) {
        urlParams.append(key, value);
      }
      const querystring = urlParams.toString();
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac
        .update(Buffer.from(querystring.toString(), "utf-8"))
        .digest("hex");
      urlParams.append("vnp_SecureHash", signed);
      const paymentUrl = `${vnpUrl}?${urlParams.toString()}`;
      console.log(paymentUrl);
      res.status(200).json({ url: paymentUrl });
    }

});

// @desc    Get order by ID
// @route   POST /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to delivered
// @route   POST /api/orders/:id/deliver
// @access  Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrder = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");

  res.json(orders);
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrder,
  getOrders,
  statistical,
};
