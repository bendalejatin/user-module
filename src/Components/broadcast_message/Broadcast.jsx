//update as per ronak one

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import CampaignIcon from "@mui/icons-material/Campaign";
import "./Broadcast.css";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://entrykart-admin.onrender.com" ; // deployment url

const tabs = ["All", "Society"];

const Broadcast = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
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
        const broadcastMessages = response.data.filter(
          (broadcast) =>
            broadcast.broadcastType === "society" ||
            broadcast.broadcastType === "all"
        );
        setBroadcasts(broadcastMessages);
        setFilteredBroadcasts(broadcastMessages);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch messages.");
        setLoading(false);
        console.error("Error:", err);
      }
    };
    fetchBroadcasts();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "All") {
      setFilteredBroadcasts(broadcasts);
    } else {
      const lowerTab = tab.toLowerCase();
      const filtered = broadcasts.filter(
        (b) => b.broadcastType.toLowerCase() === lowerTab
      );
      setFilteredBroadcasts(filtered);
    }
  };

  if (loading) {
    return (
      <div >
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
        {/* <h2>
          <CampaignIcon fontSize="medium" className="campaignIcon" /> Your
          Broadcast Messages
        </h2> */}

        <div className="broadcast-tabs">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`broadcast-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className="broadcast-list">
          {filteredBroadcasts.length > 0 ? (
            filteredBroadcasts.map((broadcast) => (
              <div className="broadcast-card" key={broadcast._id}>
                <div className="broadcast-card-content">
                  <h3>{broadcast.message}</h3>
                  <p>Type: {broadcast.broadcastType}</p>
                  <p>
                    Society:{" "}
                    {broadcast.broadcastType === "society"
                      ? broadcast.society
                      : "All Societies"}
                  </p>
                  <p className="timestamp">
                    {new Date(broadcast.createdAt).toLocaleString()}
                  </p>
                </div>
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
