import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import Navbar from "../Navbar/Navbar";
import "./Maintenance.css";
import TabBar from "../TabBar/TabBar";
import SystemUpdateAltOutlinedIcon from "@mui/icons-material/SystemUpdateAltOutlined";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://backend-clr8.onrender.com" ; // deployment url

const Receipt = ({ profile, maintenance, paymentDate }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Maintenance Payment Receipt", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 20, 30);
    doc.text(
      `Receipt No: ${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`,
      pageWidth - 20,
      30,
      { align: "right" }
    );

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 40, pageWidth - 30, 50, 3, 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Owner Details", 20, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${profile?.ownerName || "N/A"}`, 20, 58);
    doc.text(`Society: ${profile?.societyName || "N/A"}`, 20, 66);
    doc.text(`Flat Number: ${profile?.flatNumber || "N/A"}`, 20, 74);
    doc.text(`Email: ${profile?.email || "N/A"}`, 20, 82);

    doc.roundedRect(15, 100, pageWidth - 30, 60, 3, 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Payment Details", 20, 108);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Amount: Rs. ${maintenance?.amount?.toLocaleString() || 0}`, 20, 118);
    doc.text(`Penalty: Rs. ${maintenance?.penalty?.toLocaleString() || 0}`, 20, 126);
    doc.text(
      `Total Paid: Rs. ${((maintenance?.amount || 0) + (maintenance?.penalty || 0)).toLocaleString()}`,
      20,
      134
    );
    doc.text(`Due Date: ${maintenance?.dueDate || "N/A"}`, 20, 142);
    doc.text(`Payment Date: ${paymentDate || "N/A"}`, 20, 150);
    doc.text(`Status: ${maintenance?.status || "N/A"}`, 20, 158);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.text("Thank you for your payment!", pageWidth / 2, 175, { align: "center" });
    doc.text(
      "We appreciate your prompt response and continued cooperation.",
      pageWidth / 2,
      185,
      { align: "center" }
    );

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "This is a computer-generated receipt and does not require a physical signature.",
      pageWidth / 2,
      200,
      { align: "center" }
    );

    doc.save(
      `Maintenance_Receipt_${profile?.flatNumber || "Unknown"}_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  return (
    <button onClick={generatePDF} className="receipt-button">
      <SystemUpdateAltOutlinedIcon />
      Receipt
    </button>
  );
};

const MaintenancePage = () => {
  const [profile, setProfile] = useState({
    ownerName: "",
    societyName: "",
    flatNumber: "",
    email: "",
  });
  const [maintenance, setMaintenance] = useState({
    amount: 1000,
    dueDate: "",
    status: "Pending",
    penalty: 0,
  });
  const [payment, setPayment] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("ownerEmail");
    if (!email) {
      setError("Please log in to view maintenance details.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const profileResponse = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
        );
        const owner = profileResponse.data;
        setProfile({
          ownerName: owner.ownerName || "N/A",
          societyName: owner.societyName || "N/A",
          flatNumber: owner.flatNumber || "N/A",
          email: owner.email || "N/A",
        });

        const maintenanceResponse = await axios.get(
          `${BASE_URL}/api/maintenance/maintenance/${email}`
        );
        const { maintenance: maint } = maintenanceResponse.data;
        setMaintenance({
          amount: maint?.amount || 1000,
          dueDate: maint?.dueDate
            ? new Date(maint.dueDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          status: maint?.status || "Pending",
          penalty: maint?.penalty || 0,
        });

        setPayment((prev) => ({
          ...prev,
          amount: maint?.status === "Paid" ? "" : (maint?.amount || 0) + (maint?.penalty || 0),
        }));

        const historyResponse = await axios.get(
          `${BASE_URL}/api/maintenance/history/${email}`
        );
        setHistory(historyResponse.data || []);

        setError("");
      } catch (err) {
        console.error("Error fetching maintenance data:", err);
        setError(
          err.response?.status === 404
            ? "No maintenance records found."
            : "Failed to fetch maintenance details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment({ ...payment, [name]: value });
  };

  const submitPayment = async () => {
    if (!payment.amount || Number(payment.amount) <= 0) {
      setError("Valid payment amount is required.");
      return;
    }

    const email = localStorage.getItem("ownerEmail");
    try {
      const response = await axios.post(`${BASE_URL}/api/maintenance/maintenance`, {
        email,
        paymentDate: payment.paymentDate,
      });

      setMaintenance({
        amount: response.data.amount,
        dueDate: new Date(response.data.dueDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: response.data.status,
        penalty: response.data.penalty,
      });

      const historyResponse = await axios.get(
        `${BASE_URL}/api/maintenance/history/${email}`
      );
      setHistory(historyResponse.data);

      setPayment({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
      });
      setError("");
      alert("Payment submitted successfully!");
    } catch (err) {
      setError(
        "Error submitting payment: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error submitting payment:", err);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">
          <h2>Loading...</h2>
        </div>
        <TabBar />
      </div>
    );
  }

  if (error && !profile.ownerName) {
    return (
      <div className="maintenance-container">
        <Navbar />
        <p>{error}</p>
        <TabBar />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="maintenance-container">
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className="maintenance-section card current-payment-card">
          <h2 className="section-title current-payment-title">Current Payment</h2>
          <div className="maintenance-details">
            <p className="amount">₹{maintenance.amount.toLocaleString()}</p>
            <div className="details-row">
              <span>Due by {maintenance.dueDate}</span>
              <span
                className={`status-badge status-${maintenance.status.toLowerCase()}`}
              >
                {maintenance.status}
              </span>
              <span className="late-fee">Late fee: ₹{maintenance.penalty}</span>
            </div>
            {maintenance.status === "Paid" ? (
              <div className="payment-action">
                <Receipt
                  profile={profile}
                  maintenance={maintenance}
                  paymentDate={payment.paymentDate}
                />
              </div>
            ) : (
              <div className="payment-action">
                <div className="form-group">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={payment.amount}
                    onChange={handlePaymentChange}
                    placeholder="Enter payment amount"
                    required
                    min={maintenance.amount + maintenance.penalty}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    value={payment.paymentDate}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
                <button onClick={submitPayment} className="submit-button">
                  Pay Now
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="history-section">
          <h2 className="section-title">Payment History</h2>
          {history.length > 0 ? (
            <div className="card-grid">
              {history.map((record) => (
                <div key={record._id} className="record-card">
                  <div className="card-row">
                    <span className="label">
                      {new Date(record.dueDate).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="value">
                      ₹{record.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="card-row">
                    <span
                      className={`status-badge status-${record.status.toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                    <span className="payment-date">
                      Paid on{" "}
                      {record.paymentDate
                        ? new Date(record.paymentDate).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short" }
                          )
                        : "N/A"}
                    </span>
                  </div>
                  {record.status === "Paid" && (
                    <div className="card-row receipt-row">
                      <Receipt
                        profile={profile}
                        maintenance={{
                          amount: record.amount,
                          dueDate: new Date(record.dueDate).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          ),
                          status: record.status,
                          penalty: record.penalty,
                        }}
                        paymentDate={
                          record.paymentDate
                            ? new Date(record.paymentDate).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "short", year: "numeric" }
                              )
                            : "N/A"
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No payment history available.</p>
          )}
        </div>
      </div>
      <TabBar />
    </>
  );
};

export default MaintenancePage;