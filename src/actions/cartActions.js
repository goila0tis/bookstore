import axios from "axios";
import {
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_DETAILS_REQUEST,
  CART_DETAILS_FAIL,
  CART_DETAILS_SUCCESS,
  CART_ADD_ITEM_REQUEST,
  CART_ADD_ITEM_FAIL,
  CART_ADD_ITEM_SUCCESS
} from "../constants/cartConstants";

export const getCart = () => async (dispatch, getState) => {
  try {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("tk");
    if (!isAuthenticated) {
      alert("Please login to view cart");
      return;
    }
    const config = {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    dispatch({ type: CART_DETAILS_REQUEST });
    const { data } = await axios.get(`/api/cart`, config);
    
    dispatch({
      type: CART_DETAILS_SUCCESS,
      payload: {
        cart: data.cart,
      },
    });
  } catch (error) {
    dispatch({
      type: CART_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
export const addToCart = (id, qty) => async (dispatch, getState) => {
  try {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("tk");
    if (!isAuthenticated) {
      alert("Please login to view cart");
      return;
    }
    const config = {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    dispatch({
      type: CART_ADD_ITEM_REQUEST,
    });
    const { data } = await axios.post(`/api/cart/add`, { id, qty }, config);
    dispatch({
      type: CART_ADD_ITEM_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: CART_ADD_ITEM_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }  
  

};

// export const removeFromCart = (id) => (dispatch, getState) => {
//   dispatch({
//     type: CART_REMOVE_ITEM,
//     payload: id,
//   });

//   localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
// };

export const saveShippingAddress = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  });

  localStorage.setItem("shippingAddress", JSON.stringify(data));
};

export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  localStorage.setItem("paymentMethod", JSON.stringify(data));
};
