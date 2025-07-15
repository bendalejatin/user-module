import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import "./NeighborDetails.css";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://entrykart-admin.onrender.com" ; // deployment url

const NeighborDetails = () => {
  const [neighbors, setNeighbors] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ownerEmail = localStorage.getItem("ownerEmail");

  useEffect(() => {
    if (!ownerEmail) {
      setError("Please log in to view neighbor details.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile to get societyId
        const profileResponse = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${ownerEmail}`
        );
        const owner = profileResponse.data;
        console.log("User Profile Response:", owner); // Debug: Log full response
        if (!owner) {
          throw new Error("User profile not found.");
        }
        if (!owner.societyId) {
          throw new Error(
            "User is not associated with any society. Contact your society admin to update your profile."
          );
        }
        setUserProfile({
          ownerName: owner.ownerName || "User",
          societyName: owner.societyName || "Unknown Society",
          societyId: owner.societyId,
          flatNumber: owner.flatNumber || "N/A",
        });

        // Fetch users in the same society
        const usersResponse = await axios.get(
          `${BASE_URL}/api/users/by-society/${owner.societyId}`
        );
        console.log("Fetched Neighbors:", usersResponse.data); // Debug: Log fetched neighbors
        // Filter out the logged-in user
        const filteredNeighbors = usersResponse.data.filter(
          (user) => user.email !== ownerEmail
        );
        setNeighbors(filteredNeighbors);

        setLoading(false);
      } catch (err) {
        setError(
          `Failed to fetch neighbor details: ${err.response?.data?.message || err.message}`
        );
        console.error("Error fetching neighbor data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [ownerEmail]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="neighbor-loading">
          <h2>Loading...</h2>
        </div>
        <TabBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="neighbor-container">
        <Navbar />
        <div className="neighbor-content">
          <h2>Error</h2>
          <p className="neighbor-error-message">{error}</p>
          <p>Please ensure your profile is correctly set up with a society ID or contact your society admin.</p>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="neighbor-container">
      <Navbar />
      <div className="neighbor-content">
        <h2>🏘️ Neighbor Details</h2>
        <p>
          Showing neighbors for {userProfile?.societyName}, Flat {userProfile?.flatNumber}
        </p>
        <div className="neighbor-list">
          {neighbors.length > 0 ? (
            neighbors.map((neighbor) => (
              <div key={neighbor._id} className="neighbor-card">
                <h3>{neighbor.name}</h3>
                <p><strong>Flat Number:</strong> {neighbor.flatNumber}</p>
                <p><strong>Email:</strong> {neighbor.email}</p>
                <p><strong>Phone:</strong> {neighbor.phone}</p>
                <p><strong>Profession:</strong> {neighbor.profession || "N/A"}</p>
                <p><strong>Society:</strong> {neighbor.society?.name || "N/A"}</p>
              </div>
            ))
          ) : (
            <p>
              No neighbors found in your society. Please check if users are correctly added to {userProfile?.societyName}.
            </p>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default NeighborDetails;