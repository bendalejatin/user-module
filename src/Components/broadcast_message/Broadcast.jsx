import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import "./Broadcast.css";

//const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const Broadcast = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const email = localStorage.getItem("ownerEmail");
        if (!email) {
          setError("Please log in to view messages.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `${BASE_URL}/api/broadcast/user?email=${email}`
        );
        // Filter to show only 'society' and 'all' type messages
        const broadcastMessages = response.data.filter(
          (broadcast) =>
            broadcast.broadcastType === "society" ||
            broadcast.broadcastType === "all"
        );
        setBroadcasts(broadcastMessages);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch messages.");
        setLoading(false);
        console.error("Error:", err);
      }
    };
    fetchBroadcasts();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="broadcast-page">
          <h2>Loading...</h2>
        </div>
        <TabBar />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="broadcast-page">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <TabBar />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="broadcast-page">
        <h2>📢 Your Broadcast Messages</h2>
        <div className="broadcast-list">
          {broadcasts.length > 0 ? (
            broadcasts.map((broadcast) => (
              <div key={broadcast._id} className="broadcast-card">
                <h3>{broadcast.message}</h3>
                <p>
                  <strong>Type:</strong> {broadcast.broadcastType}
                </p>
                {broadcast.broadcastType === "society" ? (
                  <p>
                    <strong>Society:</strong> {broadcast.society}
                  </p>
                ) : (
                  <p>
                    <strong>Society:</strong> All Societies
                  </p>
                )}
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(broadcast.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p>No messages available.</p>
          )}
        </div>
      </div>
      <TabBar />
    </>
  );
};

export default Broadcast;
