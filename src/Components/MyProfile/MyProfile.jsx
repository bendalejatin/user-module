import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import "./MyProfile.css";
import { useNavigate } from "react-router-dom";
import TabBar from "../TabBar/TabBar";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

//const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const MyProfile = () => {
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
  });
  const [member, setMember] = useState({
    name: "",
    relation: "",
    age: "",
    profession: "",
    contact: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [error, setError] = useState("");
  const [societies, setSocieties] = useState([]);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [societyFetchAttempts, setSocietyFetchAttempts] = useState(0);
  const maxFetchAttempts = 3;

  useEffect(() => {
    const email = localStorage.getItem("ownerEmail");
    if (!email) {
      setError("Please log in to view or create your profile.");
      console.log("No ownerEmail found in localStorage");
      return;
    }

    const fetchSocieties = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/flats/societies?email=${email}`
        );
        const data = response.data;
        console.log("Fetched societies:", data);
        setSocieties(data);
        if (data.length === 0 && createMode && !profile.societyName) {
          setError(
            "No societies found. You can enter a society name manually below."
          );
        } else {
          setError("");
        }
      } catch (err) {
        console.error("Error fetching societies:", err.message);
        if (societyFetchAttempts < maxFetchAttempts - 1) {
          setSocietyFetchAttempts((prev) => prev + 1);
          setTimeout(fetchSocieties, 2000);
        } else if (createMode && !profile.societyName) {
          setError(
            "Unable to load societies. You can enter a society name manually below."
          );
        } else {
          setError("");
        }
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
        );
        const owner = response.data;
        console.log("Fetched owner:", owner);

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
        });
        setCreateMode(owner._id === null);
        if (!owner.societyName && owner._id === null) {
          setError("No profile found. Please create your profile.");
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setCreateMode(true);
          setProfile((prev) => ({ ...prev, email }));
          setError("No profile found. Please create your profile.");
        } else {
          console.error("Error fetching profile:", err.message);
          setError("Failed to fetch profile. Please try again.");
        }
      }
    };

    fetchSocieties();
    fetchProfile();
  }, [societyFetchAttempts, createMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    if (name === "societyName" && value.trim()) {
      setError("");
    }
  };

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

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  const validateProfile = () => {
    if (!profile.username) return "Name is required.";
    if (!profile.phone || !/^\d{10}$/.test(profile.phone))
      return "Valid 10-digit phone number is required.";
    if (!profile.flat) return "Flat number is required.";
    if (!profile.work) return "Profession is required.";
    if (!profile.societyName) return "Society name is required.";
    return "";
  };

  const addOrUpdateMember = async () => {
    if (!member.name || !member.relation || !member.age) {
      setError("Member name, relation, and age are required.");
      return;
    }
    if (Number(member.age) <= 0) {
      setError("Age must be a positive number.");
      return;
    }

    const email = localStorage.getItem("ownerEmail");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
      );
      const owner = response.data;

      if (!owner || (!owner._id && createMode)) {
        setError("Please create your profile first.");
        return;
      }

      const memberData = {
        name: member.name,
        relation: member.relation,
        age: Number(member.age),
        profession: member.profession || "",
        contact: member.contact || "",
      };

      if (editingMemberIndex !== null) {
        await axios.put(
          `${BASE_URL}/api/flats/owner/${owner._id}/edit-family/${editingMemberIndex}`,
          memberData
        );
      } else {
        await axios.put(
          `${BASE_URL}/api/flats/owner/${owner._id}/add-family`,
          memberData
        );
      }

      const updatedResponse = await axios.get(
        `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
      );
      const updatedOwner = updatedResponse.data;

      setProfile({
        ...profile,
        members: updatedOwner.familyMembers || [],
      });
      setMember({
        name: "",
        relation: "",
        age: "",
        profession: "",
        contact: "",
      });
      setEditingMemberIndex(null);
      setError("");
    } catch (err) {
      setError("Error adding/updating member.");
      console.error("Error adding/updating member:", err.message);
    }
  };

  const editMember = (index) => {
    const memberToEdit = profile.members[index];
    setMember({
      name: memberToEdit.name,
      relation: memberToEdit.relation,
      age: memberToEdit.age.toString(),
      profession: memberToEdit.profession || "",
      contact: memberToEdit.contact || "",
    });
    setEditingMemberIndex(index);
  };

  const deleteMember = async (index) => {
    if (
      !window.confirm("Are you sure you want to delete this family member?")
    ) {
      return;
    }

    const email = localStorage.getItem("ownerEmail");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
      );
      const owner = response.data;

      if (!owner || !owner._id) {
        setError("Owner not found.");
        return;
      }

      await axios.delete(
        `${BASE_URL}/api/flats/owner/${owner._id}/delete-family/${index}`
      );

      const updatedResponse = await axios.get(
        `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
      );
      const updatedOwner = updatedResponse.data;

      setProfile({
        ...profile,
        members: updatedOwner.familyMembers || [],
      });
      setError("");
    } catch (err) {
      setError("Error deleting member.");
      console.error("Error deleting member:", err.message);
    }
  };

  const saveProfile = async () => {
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      return;
    }

    const email = localStorage.getItem("ownerEmail");
    try {
      const normalizedSocietyName = profile.societyName.toLowerCase().trim();
      if (createMode) {
        const newOwner = {
          societyName: normalizedSocietyName,
          flatNumber: profile.flat,
          ownerName: profile.username,
          profession: profile.work,
          contact: profile.phone,
          email: profile.email,
          gender: profile.gender,
          adminEmail: email,
          image: profile.image || null,
        };

        console.log("Creating new owner with:", newOwner);
        const response = await axios.post(
          `${BASE_URL}/api/flats/owner`,
          newOwner
        );
        const owner = response.data;

        setProfile({
          username: owner.ownerName,
          phone: owner.contact,
          flat: owner.flatNumber,
          gender: owner.gender,
          email: owner.email,
          work: owner.profession,
          societyName: owner.societyName,
          image: owner.image || null,
          members: owner.familyMembers || [],
        });
        setCreateMode(false);
        setEditMode(false);
        setError("");
        alert("Profile created successfully!");
      } else {
        const response = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
        );
        const owner = response.data;

        if (!owner || !owner._id) {
          setError("Owner not found.");
          return;
        }

        const updated = {
          ownerName: profile.username,
          profession: profile.work,
          contact: profile.phone,
          email: profile.email,
          societyName: owner.societyName.toLowerCase().trim(),
          flatNumber: profile.flat,
          gender: profile.gender,
          image: profile.image || owner.image,
        };

        console.log("Updating owner with:", updated);
        await axios.put(
          `${BASE_URL}/api/flats/owner/${owner._id}/update`,
          updated
        );

        alert("Profile updated successfully!");
        setEditMode(false);
        setError("");
      }
    } catch (err) {
      setError("Error saving profile. Please try again.");
      console.error("Error saving profile:", err.message);
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ownerEmail");
    navigate("/");
  };

  // const handleBack = () => {
  //   navigate(-1);
  // };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="header">
          {/* <button className="back-button" onClick={handleBack}>
            ←
          </button> */}
          <h2 className="profile-title">My Profile</h2>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="profile-section">
          <div className="profile-image">
            <div className="image-container">
              {(editMode || createMode) && (
                <>
                  <label htmlFor="image-upload" className="placeholder-image">
                    {profile.image ? (
                      <img
                        src={profile.image}
                        alt="Profile"
                        className="profile-img"
                      />
                    ) : (
                      <>
                        <span className="centered-camera-icon">
                          <CameraAltIcon />
                        </span>
                        <span className="upload-text">Upload Photo</span>
                      </>
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  {(editMode || createMode) && profile.image && (
                    <label htmlFor="image-upload" className="camera-button">
                      <span className="camera-icon">
                        <CameraAltIcon />
                      </span>
                    </label>
                  )}
                </>
              )}
              {!(editMode || createMode) && (
                <>
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt="Profile"
                      className="profile-img"
                    />
                  ) : (
                    <div className="placeholder-image">
                      <span className="centered-camera-icon">
                        <CameraAltIcon />
                      </span>
                      <span className="upload-text">Upload Photo</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="profile-form">
            <div className="name-section">
              <label className="name-label">Name</label>
              <input
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled
                required
                className="name-input"
              />
            </div>
            <div className="name-section">
              <label className="name-label">Mobile No.</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter mobile number"
                disabled={!editMode && !createMode}
                required
                className="name-input"
              />
            </div>
            <div className="name-section">
              <label className="name-label">Flat No.</label>
              <input
                name="flat"
                value={profile.flat}
                onChange={handleChange}
                placeholder="Flat Number"
                disabled
                required
                className="name-input"
              />
            </div>
            <div className="name-section">
              <label className="name-label">Gender</label>
              <input
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                placeholder="Select gender"
                disabled={!editMode && !createMode}
                className="name-input"
              />
            </div>
            <div className="name-section">
              <label className="name-label">Email ID</label>
              <input
                name="email"
                value={profile.email}
                placeholder="Enter email"
                disabled
                className="name-input"
              />
            </div>
            <div className="name-section">
              <label className="name-label">Profession</label>
              <input
                name="work"
                value={profile.work}
                onChange={handleChange}
                placeholder="Enter profession"
                disabled={!editMode && !createMode}
                required
                className="name-input"
              />
            </div>
            <div className="name-section">
              <label className="name-label">Society</label>
              {createMode && (
                <input
                  name="societyName"
                  value={profile.societyName}
                  onChange={handleChange}
                  placeholder="Enter society name"
                  required
                  disabled
                  className="name-input"
                />
              )}
              {!createMode && (
                <input
                  name="societyName"
                  value={profile.societyName}
                  placeholder="Society"
                  disabled
                  className="name-input"
                />
              )}
            </div>
            {editMode || createMode ? (
              <button className="profile-button" onClick={saveProfile}>
                {createMode ? "Create Profile" : "Save Profile"}
              </button>
            ) : (
              <div className="button-group">
                <button
                  className="profile-button"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {!createMode && (
          <div className="member-section">
            <h3 className="member-title">Family Members</h3>
            <div className="member-form">
              <div className="form-row">
                <div className="member-field">
                  <label className="name-label">Member Name</label>
                  <input
                    name="name"
                    value={member.name}
                    onChange={handleMemberChange}
                    placeholder="Enter member name"
                    required
                  />
                </div>
                <div className="member-field">
                  <label className="name-label">Relation</label>
                  <input
                    name="relation"
                    value={member.relation}
                    onChange={handleMemberChange}
                    placeholder="Relation"
                    required
                  />
                </div>
                <div className="member-field">
                  <label className="name-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={member.age}
                    onChange={handleMemberChange}
                    placeholder="Enter age"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="member-field">
                  <label className="name-label">Profession (Optional)</label>
                  <input
                    name="profession"
                    value={member.profession}
                    onChange={handleMemberChange}
                    placeholder="Enter profession"
                  />
                </div>
                <div className="member-field">
                  <label className="name-label">Contact (Optional)</label>
                  <input
                    name="contact"
                    value={member.contact}
                    onChange={handleMemberChange}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="member-field">
                  <button
                    className="add-member-button"
                    onClick={addOrUpdateMember}
                  >
                    {editingMemberIndex !== null
                      ? "Update Member"
                      : "Add Member"}
                  </button>
                </div>
              </div>
            </div>

            <div className="members-list">
              {profile.members.length > 0 ? (
                profile.members.map((mem, index) => (
                  <div key={index} className="member-card">
                    <div className="member-content">
                      <div className="member-info">
                        <p>
                          <strong>Member Name:</strong>
                        </p>
                        <p>
                          <strong>Relation:</strong>
                        </p>
                        <p>
                          <strong>Age:</strong>
                        </p>
                        <p>
                          <strong>Profession:</strong>
                        </p>
                        <p>
                          <strong>Contact:</strong>
                        </p>
                      </div>
                      <div className="member-data">
                        <p>{mem.name}</p>
                        <p>{mem.relation}</p>
                        <p>{mem.age}</p>
                        <p>{mem.profession || "N/A"}</p>
                        <p>{mem.contact || "N/A"}</p>
                      </div>
                    </div>
                    <div className="button-container">
                      <button
                        className="edit-button"
                        onClick={() => editMember(index)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteMember(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No family members added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
      <TabBar />
    </>
  );
};

export default MyProfile;
