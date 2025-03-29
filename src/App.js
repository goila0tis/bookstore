import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/HomePage";
import BookDetail from "./pages/BookDetail/BookDetail";
import Cart from "./pages/Cart/Cart";
import Shipping from "./pages/Shipping/Shipping";
import Payment from "./pages/Payment/Payment";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Order from "./pages/Order/Order";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import UserList from "./pages/UserList/UserList";
import UserEdit from "./pages/UserEdit/UserEdit";
import BookList from "./pages/BookList/BookList";
import BookEdit from "./pages/BookEdit/BookEdit";
import BookCreate from "./pages/BookCreate/BookCreate";
import OrderList from "./pages/OrderList/OrderList";
import CategoryBooksPage from "./pages/CategoryBooksPage/CategoryBooksPage";
import Contact from "./components/Contact/Contact";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import Sale from "./pages/Sales/Sale";
import ProtectRoute from "./components/ProtectRoute/ProtectRoute";
import { ToastContainer, Bounce } from "react-toastify";
const App = () => {
  return (
    <div className="app">
      <Router>
        <Header />
        <main>
          <Routes>
            <Route
              path="/order/:id"
              element={<ProtectRoute children={<Order />} />}
            />
            <Route
              path="/shipping"
              element={<ProtectRoute children={<Shipping />} />}
            />
            <Route
              path="/payment"
              element={<ProtectRoute children={<Payment />} />}
            />
            <Route
              path="/placeorder"
              element={<ProtectRoute children={<PlaceOrder />} />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={<ProtectRoute children={<Profile />} />}
            />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route
              path="/order-success"
              element={<ProtectRoute children={<OrderSuccess />} />}
            />
            <Route
              path="/cart"
              element={<ProtectRoute children={<Cart />} />}
            />
            <Route
              path="/admin/userlist"
              element={<ProtectRoute isAdmin={true} children={<UserList />} />}
            />
            <Route
              path="/admin/user/:id/edit"
              element={<ProtectRoute isAdmin={true} children={<UserEdit />} />}
            />
            <Route
              path="/admin/booklist"
              element={<ProtectRoute isAdmin={true} children={<BookList />} />}
            />
            <Route
              path="/admin/book/create"
              element={
                <ProtectRoute isAdmin={true} children={<BookCreate />} />
              }
            />
            <Route
              path="/books/categories/:categoryId"
              element={<ProtectRoute children={<CategoryBooksPage />} />}
            />
            <Route
              path="/admin/orderlist"
              element={<ProtectRoute isAdmin={true} children={<OrderList />} />}
            />
            <Route
              path="/admin/booklist/:pageNumber"
              element={<ProtectRoute isAdmin={true} children={<BookList />} />}
              exact
            />
            <Route
              path="/admin/sale"
              element={<ProtectRoute isAdmin={true} children={<Sale />} />}
            />
            <Route
              path="/admin/book/:id/edit"
              element={<ProtectRoute isAdmin={true} children={<BookEdit />} />}
            />
            <Route path="/search/:keyword" element={<Home />} exact />
            <Route path="/page/:pageNumber" element={<Home />} exact />
            <Route
              path="/search/:keyword/page/:pageNumber"
              element={<Home />}
              exact
            />
            <Route path="/" element={<Home />} exact />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
};

export default App;
