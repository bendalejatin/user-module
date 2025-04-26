import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import "./EventDetails.css";
import event_info from "../Assets/event_info.png";
import calendar from "../Assets/calendar.png";
import event_location from "../Assets/event_location.png";
import event_description from "../Assets/event_description.png";
import TabBar from "../TabBar/TabBar";

//const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const EventDetails = () => {
  const [profile, setProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [error, setError] = useState("");
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
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort ascending
          console.log("Upcoming events:", upcoming);
          setUpcomingEvents(upcoming);
          if (upcoming.length === 0) {
            setError("No upcoming events found for your society.");
          } else {
            setError("");
          }
        } catch (err) {
          console.error("Error fetching events:", err.message);
          setError("Failed to fetch events. Please try again.");
        }
      };
      fetchEvents();
    }
  }, [profile, currentDate]);

  // Find the latest upcoming event (closest to current date)
  const latestEvent =
    upcomingEvents.length > 0
      ? upcomingEvents.reduce((latest, event) => {
          const eventDate = new Date(event.date);
          const latestDate = new Date(latest.date);
          const diffCurrent = Math.abs(eventDate - currentDate);
          const diffLatest = Math.abs(latestDate - currentDate);
          return diffCurrent < diffLatest ? event : latest;
        }, upcomingEvents[0])
      : null;

  // Filter out the latest event from upcoming events for the "Upcoming Events" section
  const otherUpcomingEvents = upcomingEvents.filter(
    (event) => event._id !== (latestEvent ? latestEvent._id : null)
  );

  return (
    <>
      <Navbar />
      <div className="event-container">
        <h2 className="event-title">Event Info</h2>
        <p className="event-subtitle">Get all the details about the event</p>
        {error && <p className="error-message">{error}</p>}

        {latestEvent ? (
          <div className="event-content">
            <div className="event-info">
              <div className="info-box animate-fade-in">
                <img src={event_info} alt="Title Icon" />
                <div className="event-data">
                  <h3>Event Title</h3>
                  <p>{latestEvent.title}</p>
                </div>
              </div>

              <div className="info-box animate-fade-in">
                <img src={calendar} alt="Date Icon" />
                <div className="event-data">
                  <h3>Date</h3>
                  <p>{new Date(latestEvent.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="info-box animate-fade-in">
                <img src={event_location} alt="Location Icon" />
                <div className="event-data">
                  <h3>Event Location</h3>
                  <p>{latestEvent.location}</p>
                </div>
              </div>

              <div className="info-box animate-fade-in">
                <img src={event_description} alt="Description Icon" />
                <div className="event-data">
                  <h3>Description</h3>
                  <p>{latestEvent.description}</p>
                </div>
              </div>
            </div>

            <div className="event-image animate-slide-in">
              <img
                src={latestEvent.image || "https://via.placeholder.com/300"}
                alt={latestEvent.title}
              />
            </div>
          </div>
        ) : (
          <p>No upcoming events found for your society.</p>
        )}

        <h2 className="event-title2">Upcoming Events</h2>
        <div className="upcoming-events">
          {otherUpcomingEvents.length > 0 ? (
            otherUpcomingEvents.map((event) => (
              <div key={event._id} className="coupon-card animate-pop">
                <img
                  src={event.image || "https://via.placeholder.com/150"}
                  alt={event.title}
                />
                <h3>{event.title}</h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p>{event.description.substring(0, 60)}...</p>
              </div>
            ))
          ) : (
            <p>No additional upcoming events found for your society.</p>
          )}
        </div>
      </div>
      <TabBar />
    </>
  );
};

export default EventDetails;
