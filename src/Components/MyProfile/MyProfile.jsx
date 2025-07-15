import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MyProfile.css";
import { useNavigate } from "react-router-dom";
import TabBar from "../TabBar/TabBar";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ProfileCompletionModal from "./ProfileCompletionModal";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://backend-clr8.onrender.com" ; // deployment url

const MyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: "",
    phone: "",
    flat: "",
    gender: "",
    email: "",
    work: "",
    societyName: "",
    image: null,
    members: [],
    lastUpdated: "03:40 PM IST, May 21, 2025",
  });
  const [createMode, setCreateMode] = useState(false);
  const [error, setError] = useState("");
  const [societies, setSocieties] = useState([]);
  const [societyFetchAttempts, setSocietyFetchAttempts] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const maxFetchAttempts = 3;

  const calculateCompletionPercentage = () => {
    const fields = [
      profile.username,
      profile.phone,
      profile.flat,
      profile.gender,
      profile.email,
      profile.work,
      profile.societyName,
    ];
    const totalFields = fields.length;
    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  useEffect(() => {
    const email = localStorage.getItem("ownerEmail");
    if (!email) {
      setError("Please log in to view or create your profile.");
      return;
    }

    const fetchSocieties = async (attempt = 0) => {
      if (attempt >= maxFetchAttempts) {
        if (createMode && !profile.societyName) {
          setError("Unable to load societies. You can enter a society name manually in the profile modal.");
        }
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/flats/societies?email=${email}`);
        setSocieties(response.data);
        if (response.data.length === 0 && createMode && !profile.societyName) {
          setError("No societies found. You can enter a society name manually in the profile modal.");
        } else {
          setError("");
        }
      } catch (err) {
        setTimeout(() => fetchSocieties(attempt + 1), 2000);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/flats/owner-by-email-fallback/${email}`);
        const owner = response.data;

        const fetchedImage =
          owner.image && owner.image !== "https://via.placeholder.com/300"
            ? owner.image
            : null;

        setProfile({
          username: owner.ownerName || "",
          phone: owner.contact || "",
          flat: owner.flatNumber || "",
          gender: owner.gender || "",
          email: owner.email || "",
          work: owner.profession || "",
          societyName: owner.societyName || "",
          image: fetchedImage,
          members: owner.familyMembers || [],
          lastUpdated: owner.lastUpdated || "03:40 PM IST, May 21, 2025",
        });
        setCreateMode(owner._id === null);
        if (!owner.societyName && owner._id === null) {
          setError("No profile found. Please create your profile in the profile modal.");
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setCreateMode(true);
          setProfile((prev) => ({ ...prev, email }));
          setError("No profile found. Please create your profile in the profile modal.");
        } else {
          setError("Failed to fetch profile. Please try again.");
        }
      }
    };

    fetchSocieties();
    fetchProfile();
  }, [createMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ownerEmail");
    navigate("/");
  };

  const editMember = (index) => {
    const memberToEdit = profile.members[index];
    navigate("/add-member", {
      state: {
        initialMember: {
          name: memberToEdit.name,
          relation: memberToEdit.relation,
          age: memberToEdit.age?.toString() || "",
          profession: memberToEdit.profession || "",
          contact: memberToEdit.contact || "",
        },
        editingMemberIndex: index,
      },
    });
  };

  const deleteMember = async (index) => {
    if (!window.confirm("Are you sure you want to delete this family member?")) {
      return;
    }

    const email = localStorage.getItem("ownerEmail");
    try {
      const response = await axios.get(`${BASE_URL}/api/flats/owner-by-email-fallback/${email}`);
      const owner = response.data;

      if (!owner || !owner._id) {
        setError("Owner not found.");
        return;
      }

      await axios.delete(`${BASE_URL}/api/flats/owner/${owner._id}/delete-family/${index}`);

      const updatedResponse = await axios.get(`${BASE_URL}/api/flats/owner-by-email-fallback/${email}`);
      const updatedOwner = updatedResponse.data;

      setProfile({
        ...profile,
        members: updatedOwner.familyMembers || [],
      });
      setError("");
    } catch (err) {
      setError("Error deleting member.");
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setCreateMode(false); // Exit create mode if profile is saved
    setError("");
  };

  return (
    <div className="my-profile-container">

      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-picture">
          {createMode ? (
            <>
              <label htmlFor="image-upload" className="image-upload-label">
                {profile.image ? (
                  <img src={profile.image} alt="Profile" className="profile-img" />
                ) : (
                  <CameraAltIcon className="camera-icon" aria-label="Upload profile picture" />
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                aria-label="Profile picture upload"
              />
            </>
          ) : (
            <>
              {profile.image ? (
                <img src={profile.image} alt="Profile" className="profile-img" />
              ) : (
                <img
                  src="https://via.placeholder.com/80?text=User"
                  alt="Default Profile"
                  className="profile-img"
                />
              )}
            </>
          )}
        </div>
      </div>
      <div
        className="profile-completion"
        style={{ cursor: "pointer" }}
        onClick={() => setShowModal(true)}
        onKeyPress={(e) => e.key === "Enter" && setShowModal(true)}
        tabIndex={0}
        role="button"
        aria-label={`Profile completion: ${completionPercentage}% complete. Click to view details.`}
      >
        <span>Profile Completion</span>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${completionPercentage}%` }}
            aria-hidden="true"
          />
        </div>
        <span>{completionPercentage}%</span>
      </div>

      {showModal && (
        <ProfileCompletionModal
          profile={profile}
          onClose={() => setShowModal(false)}
          completionPercentage={completionPercentage}
          onProfileUpdate={handleProfileUpdate}
          createMode={createMode}
        />
      )}

      {error && <p className="error-message">{error}</p>}
      <div className="profile-details">
        <div className="detail-item">
          <div className="view-mode">
            <span className="label">Full Name</span>
            <span className="detail-value">{profile.username || "Not provided"}</span>
          </div>
        </div>
        <div className="detail-item">
          <div className="view-mode">
            <span className="label">Mobile Number</span>
            <span className="detail-value">{profile.phone || "Not provided"}</span>
          </div>
        </div>
        <div className="detail-item">
          <div className="view-mode">
            <span className="label">Flat Number</span>
            <span className="detail-value">{profile.flat || "Not provided"}</span>
          </div>
        </div>
        <div className="detail-item">
          <div className="view-mode">
            <span className="label">Gender</span>
            <span className="detail-value">{profile.gender || "Not provided"}</span>
          </div>
        </div>
        <div className="detail-item">
          <div className="view-mode">
            <span className="label">Email Address</span>
            <span className="detail-value">{profile.email || "Not provided"}</span>
          </div>
        </div>
        <div className="detail-item">
          <div className="view-mode">
            <span className="label">Profession</span>
            <span className="detail-value">{profile.work || "Not provided"}</span>
          </div>
        </div>
        <div className="detail-item">
          <div className="view-mode">
            <span className="label">Society Name</span>
            <span className="detail-value">{profile.societyName || "Not provided"}</span>
          </div>
        </div>
      </div>
      {!createMode && (
        <div className="family-members">
          <div className="family-header">
            <h2>Family Members</h2>
            <button
              className="add-member"
              onClick={() =>
                navigate("/add-member", {
                  state: {
                    initialMember: {
                      name: "",
                      relation: "",
                      age: "",
                      profession: "",
                      contact: "",
                    },
                    editingMemberIndex: null,
                  },
                })
              }
              aria-label="Add family member"
            >
              + Add Member
            </button>
          </div>

          {profile.members.map((mem, index) => (
            <div key={index} className="family-member">
              <span>{mem.name}</span>
              <div className="member-actions">
                <button
                  onClick={() => editMember(index)}
                  className="edit-button"
                  aria-label={`Edit ${mem.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMember(index)}
                  className="delete-button"
                  aria-label={`Delete ${mem.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="button-group">
        <button
          onClick={handleLogout}
          className="logout-button"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
      <TabBar />
    </div>
  );
};

export default MyProfile;

