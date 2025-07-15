import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import "./ServiceEntryDetails.css";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://backend-clr8.onrender.com" ; // deployment url

const ServiceEntryDetails = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ownerEmail = localStorage.getItem("ownerEmail");

  useEffect(() => {
    if (!ownerEmail) {
      setError("Please log in to view service entries.");
      setLoading(false);
      return;
    }
    fetchEntries();
  }, [ownerEmail]);

  const fetchEntries = async () => {
    try {
      const profileResponse = await axios.get(
        `${BASE_URL}/api/flats/owner-by-email-fallback/${ownerEmail}`
      );
      const societyId = profileResponse.data.societyId;
      if (!societyId) {
        throw new Error("Society not found for this user.");
      }
      const response = await axios.get(`${BASE_URL}/api/service-entries`, {
        params: { societyId },
      });
      setEntries(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch service entries.");
      setLoading(false);
      toast.error("Failed to fetch service entries");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="service-entry-container">
          <h2>Loading...</h2>
        </div>
        <TabBar />
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-entry-container">
        <Navbar />
        <p>{error}</p>
        <TabBar />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="service-entry-container">
      <Navbar />
      <h2 className="form-title">Service Entries</h2>
      <div className="entry-card">
        <div className="entries-list">
          {entries.length === 0 ? (
            <p>No service entries found.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry._id} className="entry-item">
                <div className="entry-details">
                  <h4>{entry.name}</h4>
                  {entry.photo && (
                    <img
                      src={entry.photo}
                      alt={entry.name}
                      className="entry-photo"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                  )}
                  <p><strong>Society:</strong> {entry.societyId?.name || "N/A"}</p>
                  <p><strong>Phone Number:</strong> {entry.phoneNumber}</p>
                  <p><strong>Visitor Type:</strong> {entry.visitorType}</p>
                  <p><strong>Status:</strong> {entry.status}</p>
                  <p><strong>Check-In:</strong> {entry.checkInTime ? new Date(entry.checkInTime).toLocaleString() : "N/A"}</p>
                  <p><strong>Check-Out:</strong> {entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleString() : "N/A"}</p>
                  <p><strong>Description:</strong> {entry.description || "N/A"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <TabBar />
      <ToastContainer />
    </div>
  );
};

export default ServiceEntryDetails;