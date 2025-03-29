const asyncHandler = require("express-async-handler");
const bookModel = require("../models/bookModel");
const { Order } = require("../models/orderModel");
// @desc    Fetch all books with category population
// @route   GET /api/books
// @access  Public
const getRecommendedBooks = asyncHandler(async (req, res) => {
  let listBooks = [];
  listBooks = await Order.aggregate([
    {
      $match: {
        $and: [
          {
            isPaid: true,
          },
          {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$orderItems"
      }
    },
    {
      $lookup: {
        from: "books",
        localField: "orderItems.book",
        foreignField: "_id",
        as: "bookDetails"
      }
    },
    //bookDetails: [{id: 1, title: "ad"}] => bookDetails: {id: 1, title: "ad"}
    {
      $unwind: {
        path: "$bookDetails"
      }
    },
    {
      $group: {
        _id: "$bookDetails._id",
        name: { $first: "$bookDetails.name" },
        price: { $first: "$bookDetails.price" },
        totalSold: { $sum: "$orderItems.qty" },
        image: { $first: "$bookDetails.image" },
        rating: { $first: "$bookDetails.rating" },
        numReviews: {
          $first: "$bookDetails.numReviews"
        }
      }
    },
    {
      $sort: {
        totalSold: 1
      }
    },
    {
      $limit: 5
    },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        image: 1,
        rating: 1,
        numReviews: 1,
      }
    }
  ]);
  if (!listBooks || listBooks.length < 10) {
    listBooks = await bookModel.find({}).select("_id name price image rating numReviews").sort({createdAt: 1}).limit(10);
  }
  res.json(listBooks);
});
const getBooks = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const count = await bookModel.countDocuments({ ...keyword });
  const books = await bookModel
    .find({ ...keyword })
    .populate("category", "name description") // Populate category details
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  console.log(books);

  res.json({ books, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single book with category population
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  const book = await bookModel
    .findById(req.params.id)
    .populate("category", "name description");

  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});
// @desc    Delete a Book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await bookModel.findById(req.params.id);

  if (book) {
    // Kiểm tra nếu người dùng là Admin
    if (req.user && req.user.isAdmin) {
      await Book.findByIdAndDelete(req.params.id);
      res.json({ message: "Book removed" });
    } else {
      res.status(401);
      throw new Error("Not authorized to delete this book");
    }
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc    Create a Book
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    author,
    genre,
    description,
    category,
    image,
    countInStock,
  } = req.body;

  // Kiểm tra xem category có tồn tại không
  if (!category) {
    res.status(400);
    throw new Error("Category is required");
  }

  let imagePath = "/images/sample.jpg";
  if (image) {
    imagePath = image;
  }

  const stock = countInStock || 0;

  // Tạo sách với các thông tin đã nhận
  const book = new bookModel({
    name: name || "No name",
    price: price || 0,
    user: req.user._id,
    image: imagePath,
    author: author || "No author",
    genre: genre || "Unknown",
    countInStock: stock,
    numReviews: 0,
    description: description || "No description",
    category,
  });

  // Lưu sách vào cơ sở dữ liệu
  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// @desc    Update a Book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    author,
    genre,
    countInStock,
    category,
  } = req.body;

  const book = await Book.findById(req.params.id);

  if (book) {
    book.name = name || book.name;
    book.price = price || book.price;
    book.description = description || book.description;
    book.image = image || book.image;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.countInStock = countInStock || book.countInStock;
    book.category = category || book.category; // Cập nhật category nếu có thay đổi

    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc    Create new review
// @route   POST /api/books/:id/reviews
// @access  Private
const createBookReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const book = await Book.findById(req.params.id);

  if (book) {
    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Book already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    book.reviews.push(review);

    book.numReviews = book.reviews.length;

    // Calculate average rating
    book.rating =
      book.reviews.reduce((acc, item) => item.rating + acc, 0) /
      book.reviews.length;

    await book.save();

    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc    Get top rated books
// @route   GET /api/books/top
// @access  Public
const getTopBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({}).sort({ rating: -1 }).limit(4);

  res.json(books);
});

const getBooksByCategory = async (categoryId) => {
  try {
    const books = await Book.find({ category: categoryId }); // Tìm các sách có category trùng với categoryId
    return books;
  } catch (error) {
    console.error("Error fetching books by category:", error);
    throw error;
  }
};

module.exports = {
  getBooks,
  getBookById,
  deleteBook,
  createBook,
  updateBook,
  createBookReview,
  getTopBooks,
  getBooksByCategory,
  getRecommendedBooks
};
