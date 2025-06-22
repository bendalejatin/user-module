import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileCompletionModal.css";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url


const ProfileCompletionModal = ({ profile, onClose, onProfileUpdate, createMode }) => {
  const [editMode, setEditMode] = useState(createMode || false);
  const [formData, setFormData] = useState({
    username: profile.username || "",
    phone: profile.phone || "",
    email: profile.email || "",
    flat: profile.flat || "",
    gender: profile.gender || "",
    work: profile.work || "",
    societyName: profile.societyName || "",
    image: profile.image || null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const fields = [
      formData.username,
      formData.phone,
      formData.email,
      formData.flat,
      formData.gender,
      formData.work,
      formData.societyName,
      formData.image,
    ];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    const totalFields = fields.length;
    return Math.round((filledFields / totalFields) * 100);
  };

  useEffect(() => {
    setCompletionPercentage(calculateCompletionPercentage());
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
    setSuccess("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        setSuccess("");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should not exceed 5MB.");
        setSuccess("");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfile = () => {
    if (!formData.username.trim()) return "Name is required.";
    if (!formData.phone || !/^\d{10}$/.test(formData.phone))
      return "Valid 10-digit phone number is required.";
    if (!formData.flat.trim()) return "Flat number is required.";
    if (!formData.work.trim()) return "Profession is required.";
    if (!formData.societyName.trim()) return "Society name is required.";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return "Valid email is required.";
    return "";
  };

  const formatDateTime = () => {
    const now = new Date();
    return now.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }) + " IST, " + now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const handleSave = async () => {
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");
    const email = localStorage.getItem("ownerEmail");

    try {
      const normalizedSocietyName = formData.societyName.toLowerCase().trim();
      const updatedTime = formatDateTime();

      if (createMode) {
        const newOwner = {
          societyName: normalizedSocietyName,
          flatNumber: formData.flat,
          ownerName: formData.username,
          profession: formData.work,
          contact: formData.phone,
          email: formData.email || null,
          gender: formData.gender || null,
          adminEmail: email,
          image: formData.image || null,
        };

        const response = await axios.post(`${BASE_URL}/api/flats/owner`, newOwner);
        const owner = response.data;

        const updatedProfile = {
          username: owner.ownerName,
          phone: owner.contact,
          flat: owner.flatNumber,
          gender: owner.gender || "",
          email: owner.email || "",
          work: owner.profession,
          societyName: owner.societyName,
          image: owner.image || null,
          members: owner.familyMembers || [],
          lastUpdated: updatedTime,
        };

        onProfileUpdate(updatedProfile);
        setSuccess("Profile created successfully!");
      } else {
        const response = await axios.get(`${BASE_URL}/api/flats/owner-by-email-fallback/${email}`);
        const owner = response.data;

        if (!owner || !owner._id) {
          setError("Owner not found.");
          setIsSaving(false);
          return;
        }

        const updated = {
          ownerName: formData.username,
          profession: formData.work,
          contact: formData.phone,
          email: formData.email || null,
          societyName: normalizedSocietyName,
          flatNumber: formData.flat,
          gender: formData.gender || null,
          image: formData.image || owner.image,
        };

        await axios.put(`${BASE_URL}/api/flats/owner/${owner._id}/update`, updated);

        const updatedProfile = {
          ...profile,
          username: formData.username,
          phone: formData.phone,
          flat: formData.flat,
          gender: formData.gender || "",
          email: formData.email || "",
          work: formData.work,
          societyName: formData.societyName,
          image: formData.image || profile.image,
          lastUpdated: updatedTime,
        };

        onProfileUpdate(updatedProfile);
        setSuccess("Profile updated successfully!");
      }
      setEditMode(false);
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error saving profile:", err);
      if (err.response?.data?.message?.includes("E11000 duplicate key")) {
        setError(`The email "${formData.email}" is already in use. Please use a different email.`);
      } else {
        setError(err.response?.data?.message || "Error saving profile. Please try again.");
      }
      setSuccess("");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError("");
    setSuccess("");
    if (editMode) {
      setFormData({
        username: profile.username || "",
        phone: profile.phone || "",
        email: profile.email || "",
        flat: profile.flat || "",
        gender: profile.gender || "",
        work: profile.work || "",
        societyName: profile.societyName || "",
        image: profile.image || null,
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={onClose} className="back-button" aria-label="Back to previous page">
            &lt;
          </button>
          <h2>My Profile</h2>
          <button
            onClick={toggleEditMode}
            className="edit-toggle-button"
            aria-label={editMode ? "Cancel edit" : "Edit profile"}
            disabled={isSaving}
          >
            <EditIcon className="edit-icon" />
          </button>
        </div>
        <div className="completion-section">
          <div className="profile-picture">
            {editMode ? (
              <>
                <label htmlFor="modal-image-upload" className="image-upload-label">
                  {formData.image ? (
                    <img src={formData.image} alt="Profile" className="profile-img" />
                  ) : (
                    <CameraAltIcon className="camera-icon" aria-label="Upload profile picture" />
                  )}
                </label>
                <input
                  id="modal-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  aria-label="Profile picture upload"
                  disabled={isSaving}
                />
              </>
            ) : (
              <>
                {formData.image ? (
                  <img src={formData.image} alt="Profile" className="profile-img" />
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
          <div className="completion-text">
            <span>{completionPercentage}% Complete</span>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <div className="fields-status">
          <div className="field-item">
            <span>Full Name</span>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!editMode || isSaving}
              placeholder="Enter your full name"
              className="modal-input"
              aria-label="Full name"
            />
          </div>
          <div className="field-item">
            <span>Mobile Number</span>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editMode || isSaving}
              placeholder="Enter mobile number"
              className="modal-input"
              aria-label="Mobile number"
            />
          </div>
          <div className="field-item">
            <span>Email Address</span>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editMode || isSaving}
              placeholder="Enter email address"
              className="modal-input"
              aria-label="Email address"
            />
          </div>
          <div className="field-item">
            <span>Flat Number</span>
            <input
              name="flat"
              value={formData.flat}
              onChange={handleChange}
              disabled={!editMode || isSaving}
              placeholder="Enter flat number"
              className="modal-input"
              aria-label="Flat number"
            />
          </div>
          <div className="field-item">
            <span>Gender</span>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!editMode || isSaving}
              className="modal-input"
              aria-label="Gender"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="field-item">
            <span>Profession</span>
            <input
              name="work"
              value={formData.work}
              onChange={handleChange}
              disabled={!editMode || isSaving}
              placeholder="Enter profession"
              className="modal-input"
              aria-label="Profession"
            />
          </div>
          <div className="field-item">
            <span>Society Name</span>
            <input
              name="societyName"
              value={formData.societyName}
              onChange={handleChange}
              disabled={!editMode || isSaving}
              placeholder="Enter society name"
              className="modal-input"
              aria-label="Society name"
            />
          </div>
        </div>
        {editMode && (
          <div className="save-button-container">
            <button
              onClick={handleSave}
              className="save-button"
              aria-label="Save profile changes"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
        {profile.members && profile.members.length > 0 && (
          <div className="family-members-list">
            <h3>Family Members</h3>
            {profile.members.map((famMember, index) => (
              <div key={index} className="family-member-card">
                <div className="member-info">
                  <span className="member-name">{famMember.name}</span>
                  <span className="member-age-profession">
                    Age: {famMember.age}
                    {famMember.profession ? ` • ${famMember.profession}` : ""}
                  </span>
                  {famMember.contact && (
                    <span className="member-contact">{famMember.contact}</span>
                  )}
                </div>
                <div className="member-details">
                  <span className="member-relation">{famMember.relation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletionModal;