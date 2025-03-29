import React, { useEffect } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message/Message";
import { addToCart, getCart } from "../../actions/cartActions";
import "./Cart.css";
import { toast } from "react-toastify";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { cartItems, success, error } = cart;
  console.log(cart);
  
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);
  useEffect(() => {    
    if (success) {     

      toast.success("Change quantity successfully!");
      dispatch(getCart());
      dispatch({ type: "CART_RESET" });
    }
    if (error) {
      alert(error);
      dispatch({ type: "CART_RESET_ERROR" });
    }
  }, [dispatch, success, error]);
  const removeFromCartHandler = (id) => {
    // dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    // navigate("/login?redirect=shipping");
    navigate("/shipping");
  };
  const handleIncrease = (e, item) => {
    dispatch(addToCart(item.book._id, 1));
  };
  const handleDecrease = (e, item) => {
    dispatch(addToCart(item.book._id, -1));
  };
  return (
    <div className="cart row">
      <div className="col-md-8 ">
        <h2>Shopping Cart</h2>
        { !cartItems || cartItems?.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="list-group bg-color cart-item">
            {cartItems?.map((item) => (
              <div className="list-group-item bg-color" key={item.book._id}>
                <div className="row">
                  <div className="col-md-2">
                    <img
                      className="img-fluid rounded"
                      src={item.book.image}
                      alt={item.book.name}
                    />
                  </div>
                  <div className="col-md-3">
                    <Link to={`/book/${item.book}`}>{item.book.name}</Link>
                  </div>
                  <div className="col-md-2">${item.book.price}</div>
                  <div className="col-md-3">
                    <button
                      className="py-1 px-3 me-2 rounded border-0 bg-light"
                      onClick={(e) => handleIncrease(e, item)}
                      disabled={item.qty >= item.book.countInStock}
                    >
                      +
                    </button>
                    <input
                      type="text"
                      readOnly
                      style={{ width: "50px" }}
                      className="form-control d-inline-block "
                      value={item.qty}
                    />
                    <button
                      className="ms-1 py-1 px-3 rounded border-0 bg-light"
                      onClick={(e) => handleDecrease(e, item)}
                      disabled={item.qty <= 1}
                    >
                      -
                    </button>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-light"
                      onClick={() => removeFromCartHandler(item.book)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="col-md-4">
        <div className="card checkout-group">
          <div className="list-group">
            <div className="list-group-item bg-color">
              <h2>
                Sub total ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                Items
              </h2>
              $
              {cartItems
                .reduce((acc, item) => acc + item.qty * item.book.price, 0)
                .toFixed(2)}
            </div>
            <div className="list-group-item bg-color">
              <button
                type="button"
                className="btn checkout-btn"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
