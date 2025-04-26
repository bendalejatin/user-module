import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import Navbar from "../Navbar/Navbar";
import "./Maintenance.css";
import TabBar from "../TabBar/TabBar";

//const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const Receipt = ({ profile, maintenance, paymentDate }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Maintenance Payment Receipt", pageWidth / 2, 20, {
      align: "center",
    });

    // Date and Receipt Number
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

    // Owner Details Box
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 40, pageWidth - 30, 50, 3, 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Owner Details", 20, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${profile.ownerName}`, 20, 58);
    doc.text(`Society: ${profile.societyName}`, 20, 66);
    doc.text(`Flat Number: ${profile.flatNumber}`, 20, 74);
    doc.text(`Email: ${profile.email}`, 20, 82);

    // Payment Details Box
    doc.roundedRect(15, 100, pageWidth - 30, 60, 3, 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Payment Details", 20, 108);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Amount: Rs. ${maintenance.amount.toLocaleString()}`, 20, 118);
    doc.text(`Penalty: Rs. ${maintenance.penalty.toLocaleString()}`, 20, 126);
    doc.text(
      `Total Paid: Rs. ${(
        maintenance.amount + maintenance.penalty
      ).toLocaleString()}`,
      20,
      134
    );
    doc.text(`Due Date: ${maintenance.dueDate}`, 20, 142);
    doc.text(`Payment Date: ${paymentDate || "N/A"}`, 20, 150);
    doc.text(`Status: ${maintenance.status}`, 20, 158);

    // Thank You note
    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.text("Thank you for your payment!", 105, 175, null, null, "center");
    doc.text(
      "We appreciate your prompt response and continued cooperation.",
      105,
      185,
      null,
      null,
      "center"
    );

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "This is a computer-generated receipt and does not require a physical signature.",
      pageWidth / 2,
      200,
      { align: "center" }
    );

    // Save PDF
    doc.save(
      `Maintenance_Receipt_${profile.flatNumber}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  return (
    <button onClick={generatePDF} className="receipt-button">
      <i className="fas fa-download"></i> Download Receipt
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
  const [pendingPayments, setPendingPayments] = useState({
    payments: [],
    totalPending: 0,
    count: 0,
  });
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
        // Fetch profile
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

        // Fetch maintenance
        const maintenanceResponse = await axios.get(
          `${BASE_URL}/api/maintenance/maintenance/${email}`
        );
        const { maintenance: maint } = maintenanceResponse.data;
        setMaintenance({
          amount: maint.amount || 1000,
          dueDate: maint.dueDate
            ? new Date(maint.dueDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "N/A",
          status: maint.status || "Pending",
          penalty: maint.penalty || 0,
        });

        // Set default payment amount (including penalty for pending/overdue)
        setPayment((prev) => ({
          ...prev,
          amount: maint.status === "Paid" ? "" : maint.amount + maint.penalty,
        }));

        // Fetch history
        const historyResponse = await axios.get(
          `${BASE_URL}/api/maintenance/history/${email}`
        );
        setHistory(historyResponse.data || []);

        // Fetch pending payments
        const pendingResponse = await axios.get(
          `${BASE_URL}/api/maintenance/pending/${email}`
        );
        setPendingPayments({
          payments: pendingResponse.data.pendingPayments || [],
          totalPending: pendingResponse.data.totalPending || 0,
          count: pendingResponse.data.count || 0,
        });

        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.status === 404
            ? "No maintenance records found. Contact your admin."
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
      const response = await axios.post(
        `${BASE_URL}/api/maintenance/maintenance`,
        {
          email,
          paymentDate: payment.paymentDate,
        }
      );

      setMaintenance({
        amount: response.data.amount,
        dueDate: new Date(response.data.dueDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        status: response.data.status,
        penalty: response.data.penalty,
      });

      // Refresh history
      const historyResponse = await axios.get(
        `${BASE_URL}/api/maintenance/history/${email}`
      );
      setHistory(historyResponse.data);

      // Refresh pending payments
      const pendingResponse = await axios.get(
        `${BASE_URL}/api/maintenance/pending/${email}`
      );
      setPendingPayments({
        payments: pendingResponse.data.pendingPayments || [],
        totalPending: pendingResponse.data.totalPending || 0,
        count: pendingResponse.data.count || 0,
      });

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
      <>
        <Navbar />
        <div className="maintenance-container">
          <h1 className="page-title">Maintenance Payment</h1>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i> Loading...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="maintenance-container">
        <h1 className="page-title">Maintenance Payment</h1>
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* <div className="profile-section card">
          <h2 className="section-title">
            <i className="fas fa-user"></i> Profile Details
          </h2>
          <div className="profile-details">
            <p>
              <strong>Name:</strong> {profile.ownerName}
            </p>
            <p>
              <strong>Society:</strong> {profile.societyName}
            </p>
            <p>
              <strong>Flat Number:</strong> {profile.flatNumber}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
          </div>
        </div> */}

        <div className="maintenance-section card">
          <h2 className="section-title">
            <i className="fas fa-file-invoice-dollar"></i> Current Maintenance
          </h2>
          <div className="maintenance-details">
            <p>
              <strong>Amount:</strong> ₹{maintenance.amount.toLocaleString()}
            </p>
            <p>
              <strong>Due Date:</strong> {maintenance.dueDate}
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`status-badge status-${maintenance.status.toLowerCase()}`}
              >
                {maintenance.status}
              </span>
            </p>
            <p>
              <strong>Penalty (if overdue):</strong> ₹
              {maintenance.penalty.toLocaleString()}
            </p>
            <p>
              <strong>Total Due:</strong> ₹
              {(
                maintenance.amount +
                (maintenance.status === "Paid" ? 0 : maintenance.penalty)
              ).toLocaleString()}
            </p>
          </div>

          {maintenance.status === "Paid" ? (
            <div className="payment-done-message">
              <i className="fas fa-check-circle"></i>{" "}
              {new Date().getDate() < 25
                ? "No payment due for this month."
                : "Payment for this month has already been made."}
              <Receipt
                profile={profile}
                maintenance={maintenance}
                paymentDate={payment.paymentDate}
              />
            </div>
          ) : (
            <div className="payment-form">
              <h3 className="form-title">Make Payment</h3>
              <div className="form-group">
                <label htmlFor="amount">Payment Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={payment.amount}
                  onChange={handlePaymentChange}
                  placeholder="Enter payment amount"
                  required
                  min={maintenance.amount + maintenance.penalty}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date</label>
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
                <i className="fas fa-check-circle"></i> Submit Payment
              </button>
            </div>
          )}
        </div>

        <div className="pending-section card">
          <h2 className="section-title">
            <i className="fas fa-exclamation-triangle"></i> Pending Payments
          </h2>
          {pendingPayments.count > 0 ? (
            <>
              <div className="summary-info">
                <p>
                  <strong>Total Pending Amount:</strong> ₹
                  {pendingPayments.totalPending.toLocaleString()}
                </p>
                <p>
                  <strong>Number of Pending Payments:</strong>{" "}
                  {pendingPayments.count}
                </p>
              </div>

              <div className="card-grid">
                {pendingPayments.payments.map((record) => (
                  <div key={record._id} className="record-card">
                    <div className="card-row">
                      <span className="label">Amount:</span>
                      <span className="value">
                        ₹{record.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="label">Due Date:</span>
                      <span className="value">
                        {new Date(record.dueDate).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="label">Status:</span>
                      <span
                        className={`status-badge status-${record.status.toLowerCase()}`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="label">Penalty:</span>
                      <span className="value">
                        ₹{record.penalty.toLocaleString()}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="label">Total Due:</span>
                      <span className="value">
                        ₹{(record.amount + record.penalty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="no-data">No pending payments.</p>
          )}
        </div>

        <div className="history-section card">
          <h2 className="section-title">
            <i className="fas fa-history"></i> Payment History
          </h2>
          {history.length > 0 ? (
            <div className="card-grid">
              {history.map((record) => (
                <div key={record._id} className="record-card">
                  <div className="card-row">
                    <span className="label">Amount:</span>
                    <span className="value">
                      ₹{record.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Due Date:</span>
                    <span className="value">
                      {new Date(record.dueDate).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Payment Date:</span>
                    <span className="value">
                      {record.paymentDate
                        ? new Date(record.paymentDate).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Status:</span>
                    <span
                      className={`status-badge status-${record.status.toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Penalty:</span>
                    <span className="value">
                      ₹{record.penalty.toLocaleString()}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Created At:</span>
                    <span className="value">
                      {new Date(record.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Receipt:</span>
                    <span className="value">
                      {record.status === "Paid" ? (
                        <Receipt
                          profile={profile}
                          maintenance={{
                            amount: record.amount,
                            dueDate: new Date(
                              record.dueDate
                            ).toLocaleDateString("en-GB"),
                            status: record.status,
                            penalty: record.penalty,
                          }}
                          paymentDate={
                            record.paymentDate
                              ? new Date(record.paymentDate).toLocaleDateString(
                                  "en-GB"
                                )
                              : "N/A"
                          }
                        />
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>
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
