import {
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_DETAILS_REQUEST,
  CART_DETAILS_SUCCESS,
  CART_DETAILS_FAIL,
  CART_ADD_ITEM_REQUEST,
  CART_ADD_ITEM_SUCCESS,
  CART_ADD_ITEM_FAIL,
  CART_RESET,
  CART_RESET_ERROR
} from "../constants/cartConstants";

export const cartReducer = (
  state = { cartItems: [], shippingAddress: {}, success: false, error: "" },
  action
) => {
  switch (action.type) {
    case CART_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CART_DETAILS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CART_RESET:
      return {
        ...state,
        success: false,
      };
    case CART_RESET_ERROR:
      return {
        ...state,
        error: "",
      };
    case CART_DETAILS_SUCCESS:
      
      return {
        ...state,
        loading: false,
        cartItems: action.payload.cart.cartItems,
      };
    case CART_ADD_ITEM_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CART_ADD_ITEM_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
      };
    case CART_ADD_ITEM_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      };
    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      };
    default:
      return state;
  }
};
