import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./order-success.css";
const OrderSuccess = () => {
  const navigate = useNavigate(); // Hook để điều hướng
  const [isSuccess, setIsSuccess] = useState(null);
  // Giả lập thông tin giao dịch (có thể nhận từ props hoặc API)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const code = searchParams.get("vnp_ResponseCode");
    setIsSuccess(code === "00"); // Nếu code là '00' thì thành công, ngược lại thất bại
  }, [searchParams]);
  const handleBackToHome = () => {
    navigate("/"); // Điều hướng về trang chính
  };
  if (isSuccess === null) {
    return <div className="payment-success-container">Đang xử lý...</div>;
  }
  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        {isSuccess ? (
          <>
            <div className="success-icon">✔</div>
            <h1>Thanh Toán Thành Công!</h1>
            <p>Giao dịch của bạn đã được xử lý thành công.</p>
          </>
        ) : (
          <>
            <div className="error-icon">✖</div>
            <h1>Thanh Toán Thất Bại</h1>
            <p>Đã có lỗi xảy ra trong quá trình thanh toán.</p>
          </>
        )}
        <button className="back-button" onClick={handleBackToHome}>
          Quay về trang chính
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
