import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CouponDetails.css";

const CouponDetails = () => {
  const { state } = useLocation();
  const { coupon } = state || {};
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  
  if (!coupon) {
    return (
      <div className="coupon-details-container">
        <div className="top-bar">
          <h2 className="coupons-title">Scan QR Code for Entry</h2>
        </div>
        <p>No coupon data available.</p>
      </div>
    );
  }

  return (
    <div className="coupon-details-container">
      <div className="top-bar">
        <h2 className="coupons-title">Scan QR Code for Entry</h2>
      </div>
      <div className="qr-frame">
        {coupon.qrCode && <img src={coupon.qrCode} alt="QR Code" className="qr-code" />}
      </div>
      <div className="details-card">
        <h3>Event Details</h3>
        <p><strong>Event Name:</strong> {coupon.event?.title || "Tech Conference 2024"}</p>
        <p><strong>User:</strong> {coupon.userName || "N/A"}</p>
        <p><strong>Society:</strong> {coupon.society?.name || "N/A"}</p>
        <p><strong>Flat No:</strong> {coupon.flatNo || "N/A"}</p>
        <p><strong>Code:</strong> {coupon.code || "N/A"}</p>
        <p><strong>Time:</strong> {coupon.event?.time || "9:00 AM - 6:00 PM"}</p>
        <p><strong>Location:</strong> {coupon.event?.location || "Innovation Center"}</p>
        <button className="cancel-btn" onClick={handleBack}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CouponDetails;