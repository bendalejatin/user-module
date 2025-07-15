import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import "./EventDetails.css";
import TabBar from "../TabBar/TabBar";
import InfoIcon from "@mui/icons-material/Info";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://backend-clr8.onrender.com"; // deployment url

const EventDetails = () => {
  const [profile, setProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event details
  const ownerEmail = localStorage.getItem("ownerEmail");
  const currentDate = new Date();

  useEffect(() => {
    if (!ownerEmail) {
      setError("Please log in to view event details.");
      console.log("No ownerEmail found in localStorage");
      return;
    }
    console.log("Fetching profile for email:", ownerEmail);

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${ownerEmail}`
        );
        const owner = response.data;
        console.log("Fetched profile:", owner);
        if (!owner.societyName) {
          setError(
            "No society associated with your profile. Please update your profile in My Profile."
          );
          console.log("No societyName in profile");
          return;
        }
        setProfile(owner);
        setLoading(false);
        setError("");
      } catch (err) {
        console.error("Error fetching profile:", err.message);
        setError("Failed to fetch profile. Please try again.");
      }
    };

    fetchProfile();
  }, [ownerEmail]);

  useEffect(() => {
    if (profile && profile.societyName) {
      const fetchEvents = async () => {
        try {
          console.log("Fetching events for society:", profile.societyName);
          const response = await axios.get(`${BASE_URL}/api/events`, {
            params: { societyName: profile.societyName },
          });
          const fetchedEvents = response.data;
          console.log("Fetched events:", fetchedEvents);
          const upcoming = fetchedEvents
            .filter((event) => {
              const eventDate = new Date(event.date);
              const isUpcoming = eventDate >= currentDate;
              console.log(
                `Event: ${event.title}, Date: ${event.date}, Parsed Date: ${eventDate}, Is Upcoming: ${isUpcoming}`
              );
              return isUpcoming;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          console.log("Upcoming events:", upcoming);
          setUpcomingEvents(upcoming);
          if (upcoming.length === 0) {
            setError("No upcoming events found for your society.");
          } else {
            setError("");
          }
          setLoading(false);
        } catch (err) {
          console.error("Error fetching events:", err.message);
          setError("Failed to fetch events. Please try again.");
        }
      };
      fetchEvents();
    }
  }, [profile, currentDate]);

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
      <div className="event-container">
        <Navbar />
        <p>{error}</p>
        <TabBar />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="event-container">
        <h2 className="event-title"></h2>
        <p className="event-subtitle"></p>
        {error && <p className="error-message">{error}</p>}

        {selectedEvent ? (
          <div className="event-content">
            <div className="event-card animate-pop">
              <div className="event-image">
                <img
                  src={selectedEvent.image || "https://via.placeholder.com/300"}
                  alt={selectedEvent.title}
                />
              </div>
              <div className="event-details">
                <div className="event-detail-item">
                  <div className="event-icon">
                    <InfoIcon fontSize="large" className="icon" />
                  </div>
                  <div className="event-data">
                    <div className="event-data-header">
                      <h3>Event Title</h3>
                    </div>
                    <p>{selectedEvent.title}</p>
                  </div>
                </div>
                <div className="event-detail-item">
                  <div className="event-icon">
                    <CalendarMonthOutlinedIcon fontSize="large" className="icon" />
                  </div>
                  <div className="event-data">
                    <div className="event-data-header">
                      <h3>Date</h3>
                    </div>
                    <p>{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="event-detail-item">
                  <div className="event-icon">
                    <LocationOnOutlinedIcon fontSize="large" className="icon" />
                  </div>
                  <div className="event-data">
                    <div className="event-data-header">
                      <h3>Event Location</h3>
                    </div>
                    <p>{selectedEvent.location || "N/A"}</p>
                  </div>
                </div>
                <div className="event-detail-item">
                  <div className="event-icon">
                    <DescriptionOutlinedIcon fontSize="large" className="icon" />
                  </div>
                  <div className="event-data">
                    <div className="event-data-header">
                      <h3>Description</h3>
                    </div>
                    <p>{selectedEvent.description || "No description available"}</p>
                  </div>
                </div>
              </div>
              <button
                className="buttons"
                onClick={() => setSelectedEvent(null)}
                title="Back to Events"
              >
                <ArrowBackIcon fontSize="medium" />
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="event-title2">Upcoming Events</h2>
            <div className="upcoming-events">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event._id} className="event-preview animate-pop" onClick={() => setSelectedEvent(event)}>
                    <div className="event-image">
                      <img
                        src={event.image || "https://via.placeholder.com/150"}
                        alt={event.title}
                      />
                    </div>
                    <div className="event-preview-content">
                      <p><strong>Event:</strong> {event.title}</p>
                      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No upcoming events found for your society.</p>
              )}
            </div>
          </>
        )}
      </div>
      <TabBar activeSection="events" />
    </>
  );
};

export default EventDetails;