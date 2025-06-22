import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import EventIcon from "@mui/icons-material/Event";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PaymentIcon from "@mui/icons-material/Payment";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import profile from "../Assets/user.png";
import "./Dashboard.css";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const Dashboard = () => {
  const [specificBroadcasts, setSpecificBroadcasts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [maintenance, setMaintenance] = useState({
    amount: 1200,
    dueDate: "",
    status: "Paid",
    penalty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const ownerEmail = localStorage.getItem("ownerEmail");
  const currentDate = new Date("2025-06-02");

  useEffect(() => {
    if (!ownerEmail) {
      setError("Please log in to view dashboard.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch broadcasts
        const broadcastResponse = await axios.get(
          `${BASE_URL}/api/broadcast/user?email=${ownerEmail}`
        );
        const specificMessages = broadcastResponse.data.filter(
          (broadcast) => broadcast.broadcastType === "specific"
        );
        setSpecificBroadcasts(specificMessages);

        // Fetch pending entries
        const entriesResponse = await axios.get(
          `${BASE_URL}/api/entries?userEmail=${ownerEmail}&status=pending`
        );
        setPendingEntries(entriesResponse.data);

        // Fetch user profile
        const profileResponse = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${ownerEmail}`
        );
        const owner = profileResponse.data;
        setUserProfile({
          ownerName: owner.ownerName || "John Smith",
          societyName: owner.societyName || "Green Avenue Society",
          image: owner.image || profile,
        });

        // Fetch maintenance
        const maintenanceResponse = await axios.get(
          `${BASE_URL}/api/maintenance/maintenance/${ownerEmail}`
        );
        const { maintenance: maint } = maintenanceResponse.data;
        setMaintenance({
          amount: maint?.amount || 1200,
          dueDate: maint?.dueDate
            ? new Date(maint.dueDate).toLocaleDateString("en-GB")
            : "N/A",
          status: maint?.status || "Paid",
          penalty: maint?.penalty || 0,
        });

        // Fetch events
        if (owner.societyName) {
          const eventsResponse = await axios.get(`${BASE_URL}/api/events`, {
            params: { societyName: owner.societyName },
          });
          const fetchedEvents = eventsResponse.data;
          const upcoming = fetchedEvents
            .filter((event) => new Date(event.date) >= currentDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          setUpcomingEvents(upcoming);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, [ownerEmail]);

  const displayedEvents = showAllEvents
    ? upcomingEvents
    : upcomingEvents.slice(0, 2);

  const handleEntryAction = async (entryId, status) => {
    try {
      await axios.put(`${BASE_URL}/api/entries/${entryId}`, { status });
      setPendingEntries(pendingEntries.filter((entry) => entry._id !== entryId));
    } catch (err) {
      setError("Failed to update entry status.");
      console.error("Error updating entry:", err);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dash-loading">
          <h2>Loading...</h2>
        </div>
        <TabBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-container">
        <Navbar />
        <div className="dash-content">
          <h2>Error</h2>
          <p className="dash-error-message">{error}</p>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="dash-container">
      <Navbar />
      <div className="dash-content">
        <div className="dash-profile-header">
          <img
            src={userProfile?.image || profile}
            alt="Profile"
            className="dash-profile-image"
          />
          <div className="dash-profile-info">
            <h1>Welcome back, {userProfile?.ownerName || "User"}</h1>
            <h2>{userProfile?.societyName || "Unknown Society"}</h2>
          </div>
        </div>

        <div className="dash-icons-section">
          <div className="dash-grid">
            <div
              className="dash-icon"
              onClick={() => (window.location.href = "/event-details")}
            >
              <EventIcon className="dash-icon-symbol dash-yellow-symbol" />
              <p>Event Details</p>
            </div>
            <div
              className="dash-icon"
              onClick={() => (window.location.href = "/my-coupons")}
            >
              <LocalOfferIcon className="dash-icon-symbol dash-pink-symbol" />
              <p>My Coupons</p>
            </div>
            <div
              className="dash-icon"
              onClick={() => (window.location.href = "/maintenance")}
            >
              <PaymentIcon className="dash-icon-symbol dash-blue-symbol" />
              <p>Maintenance</p>
            </div>
            <div
              className="dash-icon"
              onClick={() => (window.location.href = "/entry-permission")}
            >
              <LockIcon className="dash-icon-symbol dash-yellow-symbol" />
              <p>Entry Permission</p>
              {pendingEntries.length > 0 && (
                <span className="dash-notification-badge">
                  {pendingEntries.length}
                </span>
              )}
            </div>
            <div
              className="dash-icon"
              onClick={() => (window.location.href = "/my-profile")}
            >
              <PersonIcon className="dash-icon-symbol dash-pink-symbol" />
              <p>My Profile</p>
            </div>
            <div
              className="dash-icon"
              onClick={() => (window.location.href = "/broadcast-messages")}
            >
              <NotificationsIcon className="dash-icon-symbol dash-blue-symbol" />
              <p>Broadcast Messages</p>
            </div>
          </div>
        </div>

        <div className="dash-broadcast-container">
          <div className="dash-broadcast-header">
            <h2>BROADCAST MESSAGES</h2>
            <button
              className="dash-see-all-button"
              onClick={() => (window.location.href = "/broadcast-messages")}
            >
              See All
            </button>
          </div>
          {specificBroadcasts.length > 0 ? (
            <>
              <h3>
                <span className="dash-broadcast-icon">📢</span>{" "}
                {specificBroadcasts[0].title || "NOTICE BOARD"}
              </h3>
              <p>{specificBroadcasts[0].message || "No message available"}</p>
            </>
          ) : (
            <>
              <h3>
                <span className="dash-broadcast-icon">📢</span> No New Announcements
              </h3>
              <p>Check back later for updates.</p>
            </>
          )}
        </div>

        <div className="dash-maintenance-section">
          <h2>MAINTENANCE PAYMENT</h2>
          <div className="dash-maintenance-details">
            <div className="dash-maintenance-amount">
              <p>Amount Due</p>
              <h3>₹{maintenance.amount.toLocaleString()}</h3>
            </div>
            <span
              className={`dash-status-badge dash-status-${maintenance.status.toLowerCase()}`}
            >
              {maintenance.status}
            </span>
            <a href="/maintenance" className="dash-view-details-link">
              View Details
            </a>
          </div>
        </div>

        <div className="dash-event-section">
          <div className="dash-event-header">
            <h3>Upcoming Events</h3>
            <button
              className="dash-see-all-button"
              onClick={() => (window.location.href = "/event-details")}
            >
              See All
            </button>
          </div>
          <div className="dash-event-list">
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event, index) => (
                <div
                  key={event._id}
                  className={`dash-event-card ${
                    index % 2 === 0 ? "dash-orange-bg" : "dash-purple-bg"
                  }`}
                >
                  <div>
                    <h4>{event.title}</h4>
                    <p>
                      {new Date(event.date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      • {event.time || "8:00 PM"}
                    </p>
                  </div>
                  <button
                    onClick={() => (window.location.href = "/event-details")}
                    className={`dash-get-coupon-button ${
                      index % 2 === 0 ? "dash-orange-button" : "dash-purple-button"
                    }`}
                  >
                    Get Coupon
                  </button>
                </div>
              ))
            ) : (
              <p>No upcoming events found for your society.</p>
            )}
          </div>
        </div>

        <div className="dash-pending-section">
          <h3>Pending Entry Permissions</h3>
          {pendingEntries.length > 0 ? (
            pendingEntries.slice(0, 1).map((entry) => (
              <div key={entry._id} className="dash-pending-card">
                <div className="dash-pending-details">
                  <div className="dash-pending-type">
                    <p>Visiting Help (Others)</p>
                    <p>Main Gate</p>
                  </div>
                  <div className="dash-pending-info">
                    <p>{entry.name}</p>
                    <p>{entry.visitorType}</p>
                  </div>
                </div>
                <div className="dash-pending-actions">
                  <button
                    className="dash-deny-button"
                    onClick={() => handleEntryAction(entry._id, "deny")}
                  >
                    Deny
                  </button>
                  <button
                    className="dash-approve-button"
                    onClick={() => handleEntryAction(entry._id, "allow")}
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending entry permissions found.</p>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default Dashboard;