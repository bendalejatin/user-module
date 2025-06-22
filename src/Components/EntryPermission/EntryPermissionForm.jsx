import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import "./EntryPermissionForm.css";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const EntryPermissionForm = () => {
  const [entry, setEntry] = useState({
    name: "",
    society: "",
    flatNumber: "",
    visitorType: "",
    description: "",
    dateTime: "",
    expiry: "",
    status: "pending",
    _id: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userEmail = localStorage.getItem("ownerEmail");

  useEffect(() => {
    if (!userEmail) {
      setError("Please log in to view your entry permission.");
      setLoading(false);
      return;
    }

    const fetchEntry = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/entries?userEmail=${userEmail}&status=pending`
        );
        if (response.data.length > 0) {
          const latestEntry = response.data[0];
          setEntry({
            name: latestEntry.name,
            society: latestEntry.societyId.name,
            flatNumber: latestEntry.flatNumber,
            visitorType: latestEntry.visitorType,
            description: latestEntry.description,
            dateTime: new Date(latestEntry.dateTime).toISOString().slice(0, 16),
            expiry: new Date(latestEntry.additionalDateTime)
              .toISOString()
              .slice(0, 16),
            status: latestEntry.status,
            _id: latestEntry._id,
          });
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch entry data.");
        setLoading(false);
        console.error("Error:", err);
      }
    };

    fetchEntry();
  }, [userEmail]);

  const handleAction = async (newStatus) => {
    if (!entry._id) return;

    try {
      await axios.put(`${BASE_URL}/api/entries/${entry._id}`, {
        status: newStatus,
      });
      alert(`Entry ${newStatus}ed successfully!`);
      setEntry({
        name: "",
        society: "",
        flatNumber: "",
        visitorType: "",
        description: "",
        dateTime: "",
        expiry: "",
        status: "pending",
        _id: null,
      });
    } catch (err) {
      setError("Failed to update entry status.");
      console.error("Error:", err);
    }
  };

  const handleAllow = () => handleAction("allow");
  const handleDeny = () => handleAction("deny");

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

  if (error) {
    return (
      <div className="entry-form-container">
        <Navbar />
        <div className="entry-card">
          <p>{error}</p>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="entry-form-container">
        <div className="entry-card">
          <div className="entry-form-content">
            <form className="entry-form">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                className="input-field"
                value={entry.name}
                readOnly
                placeholder="Enter Name"
              />

              <label htmlFor="society">Society</label>
              <input
                type="text"
                id="society"
                className="input-field"
                value={entry.society}
                readOnly
                placeholder="-- Select Society --"
              />

              <label htmlFor="flat-number">Flat Number</label>
              <input
                type="text"
                id="flat-number"
                className="input-field"
                value={entry.flatNumber}
                readOnly
                placeholder="-- Select Flat Number --"
              />

              <label htmlFor="visitor-type">Visitor Type</label>
              <input
                type="text"
                id="visitor-type"
                className="input-field"
                value={entry.visitorType}
                readOnly
                placeholder="-- Select Visitor Type --"
              />

              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                className="input-field"
                value={entry.description}
                readOnly
                placeholder="Enter Description"
              />

              <label htmlFor="datetime">Date & Time</label>
              <input
                type="datetime-local"
                id="datetime"
                className="input-field"
                value={entry.dateTime}
                readOnly
              />

              <label htmlFor="expiry">Expiry Date & Time</label>
              <input
                type="datetime-local"
                id="expiry"
                className="input-field"
                value={entry.expiry}
                readOnly
              />

              {entry._id && (
                <div className="decision-buttons">
                  <button
                    type="button"
                    className="submit-btn allow-btn"
                    onClick={handleAllow}
                  >
                    Allow
                  </button>
                  <button
                    type="button"
                    className="submit-btn deny-btn"
                    onClick={handleDeny}
                  >
                    Deny
                  </button>
                </div>
              )}
            </form>
            {!entry._id && <p>No pending entry permissions found.</p>}
          </div>
        </div>
      </div>
      <TabBar />
    </>
  );
};

export default EntryPermissionForm;