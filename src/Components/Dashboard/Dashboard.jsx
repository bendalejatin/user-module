import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import event_details from "../Assets/eventdashboard.png";
import my_coupons from "../Assets/coupon.png";
import fees from "../Assets/fees.png";
import form from "../Assets/form.png";
import profile from "../Assets/user.png";
import message from "../Assets/conversation.png";
import "./Dashboard.css";

//const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const Dashboard = () => {
  const [specificBroadcasts, setSpecificBroadcasts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false); // New state for toggling events
  const ownerEmail = localStorage.getItem("ownerEmail");
  const currentDate = new Date("2025-04-21");

  useEffect(() => {
    if (!ownerEmail) {
      setError("Please log in to view dashboard.");
      return;
    }
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("ownerEmail");
        if (!email) {
          setError("Please log in to view messages.");
          setLoading(false);
          return;
        }
        // Fetch broadcast messages
        const broadcastResponse = await axios.get(
          `${BASE_URL}/api/broadcast/user?email=${email}`
        );
        const specificMessages = broadcastResponse.data.filter(
          (broadcast) => broadcast.broadcastType === "specific"
        );
        setSpecificBroadcasts(specificMessages);

        // Fetch pending entries
        const entriesResponse = await axios.get(
          `${BASE_URL}/api/entries?userEmail=${email}&status=pending`
        );
        setPendingEntries(entriesResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data.");
        setLoading(false);
        console.error("Error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!ownerEmail) {
      setError("Please log in to view dashboard.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${ownerEmail}`
        );
        setUserProfile(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to fetch profile. Please try again.");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (userProfile && userProfile.societyName) {
      const fetchEvents = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/events`, {
            params: { societyName: userProfile.societyName },
          });
          const fetchedEvents = response.data;
          // Filter upcoming events and sort by date ascending
          const upcoming = fetchedEvents
            .filter((event) => new Date(event.date) >= currentDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          setUpcomingEvents(upcoming);
          setError("");
        } catch (err) {
          console.error("Error fetching events:", err);
          setError("Failed to fetch events. Please try again.");
        }
      };
      fetchEvents();
    }
  }, [userProfile]);

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
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <TabBar />
      </div>
    );
  }

  // Slice events to show only 2 by default unless showAllEvents is true
  const displayedEvents = showAllEvents
    ? upcomingEvents
    : upcomingEvents.slice(0, 2);

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <div className="hero-section">
          <h1>Welcome to Entry-Kart</h1>
          <p>Manage your society updates and more!</p>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="dashboard-icons-section">
          <div className="dashboard-grid">
            <div
              className="dashboard-icon"
              onClick={() => (window.location.href = "/event-details")}
            >
              <img src={event_details} alt="Event Details" />
              <p>Event Details</p>
            </div>
            <div
              className="dashboard-icon"
              onClick={() => (window.location.href = "/my-coupons")}
            >
              <img src={my_coupons} alt="My Coupons" />
              <p>My Coupons</p>
            </div>
            <div
              className="dashboard-icon"
              onClick={() => (window.location.href = "/maintenance")}
            >
              <img src={fees} alt="Maintenance" />
              <p>Maintenance</p>
            </div>
            <div
              className="dashboard-icon"
              onClick={() => (window.location.href = "/entry-permission")}
            >
              <img src={form} alt="Entry Form" />
              <p>Entry Permission</p>
              {pendingEntries.length > 0 && (
                <span className="notification-badge">
                  {pendingEntries.length}
                </span>
              )}
            </div>
            <div
              className="dashboard-icon"
              onClick={() => (window.location.href = "/my-profile")}
            >
              <img src={profile} alt="My Profile" />
              <p>My Profile</p>
            </div>
            <div
              className="dashboard-icon"
              onClick={() => (window.location.href = "/broadcast-messages")}
            >
              <img src={message} alt="Broadcast" />
              <p>Broadcast Messages</p>
            </div>
          </div>
        </div>

        {/* Broadcast Message Section */}
        <div className="broadcast-container">
          <h2>📢 Specific Broadcast Messages</h2>
          {specificBroadcasts.length > 0 ? (
            <ul className="broadcast-list">
              {specificBroadcasts.map((broadcast) => (
                <li key={broadcast._id} className="broadcast-item">
                  {broadcast.message} -{" "}
                  {new Date(broadcast.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No specific messages available.</p>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="event-section">
          <h3>Upcoming Events</h3>
          <div className="event-list">
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event) => (
                <div key={event._id} className="event-card">
                  <img
                    src={event.image || "https://via.placeholder.com/150"}
                    alt={event.title}
                  />
                  <h4>{event.title}</h4>
                  <p>
                    {new Date(event.date).toLocaleDateString()}, {event.time}
                  </p>
                  <button
                    onClick={() => (window.location.href = "/event-details")}
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p>No upcoming events found for your society.</p>
            )}
          </div>
          {upcomingEvents.length > 2 && (
            <span
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="more-link"
            >
              {showAllEvents ? "Show Less" : "More Events"}
            </span>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default Dashboard;
