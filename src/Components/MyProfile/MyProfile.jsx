import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import "./MyProfile.css";
import { useNavigate } from "react-router-dom";
import TabBar from "../TabBar/TabBar";

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
    image: "https://via.placeholder.com/300", // Initialize with default
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
        if (data.length === 0) {
          setError(
            "No societies found. Please enter a society name manually or contact an admin."
          );
        } else {
          setSocieties(data);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching societies:", err.message);
        if (societyFetchAttempts < maxFetchAttempts - 1) {
          setSocietyFetchAttempts((prev) => prev + 1);
          setTimeout(fetchSocieties, 2000);
        } else {
          setError(
            "Unable to load societies. Please enter a society name manually or contact an admin."
          );
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

        setProfile({
          username: owner.ownerName || "",
          phone: owner.contact || "",
          flat: owner.flatNumber || "",
          gender: owner.gender || "",
          email: owner.email || "",
          work: owner.profession || "",
          societyName: owner.societyName || "",
          image: owner.image || "https://via.placeholder.com/300", // Set image from response
          members: owner.familyMembers || [],
        });
        setCreateMode(owner._id === null);
        if (!owner.societyName && owner._id === null) {
          setError(
            "No profile found. Please create your profile with a valid society."
          );
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setCreateMode(true);
          setProfile((prev) => ({ ...prev, email }));
          setError(
            "No profile found. Please create your profile with a valid society."
          );
        } else {
          console.error("Error fetching profile:", err.message);
          setError("Failed to fetch profile. Please try again.");
        }
      }
    };

    fetchSocieties();
    fetchProfile();
  }, [societyFetchAttempts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, image: reader.result }); // Store base64 string
      };
      reader.readAsDataURL(file); // Convert image to base64
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
    if (createMode && !profile.societyName) return "Society name is required.";
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
          image: profile.image, // Include image
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
          image: owner.image, // Update with saved image
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
          image: profile.image, // Include image
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
      setError("Error saving profile. Please ensure the society exists.");
      console.error("Error saving profile:", err.message);
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ownerEmail");
    navigate("/");
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h2>{createMode ? "Create Your Profile" : "My Profile"}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="profile-section">
          <div className="profile-image">
            <img src={profile.image} alt="Profile" />
            {(editMode || createMode) && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            )}
          </div>
          <div className="profile-form">
            <input
              name="username"
              value={profile.username}
              onChange={handleChange}
              placeholder="Full Name"
              disabled={!createMode}
              required
            />
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Phone Number (10 digits)"
              disabled={!editMode && !createMode}
              required
            />
            <input
              name="flat"
              value={profile.flat}
              onChange={handleChange}
              placeholder="Flat Number"
              disabled={!createMode}
              required
            />
            <input
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              placeholder="Gender"
              disabled={!editMode && !createMode}
            />
            <input
              name="email"
              value={profile.email}
              placeholder="Email"
              disabled
            />
            <input
              name="work"
              value={profile.work}
              onChange={handleChange}
              placeholder="Profession"
              disabled={!editMode && !createMode}
              required
            />
            {createMode &&
              (societies.length > 0 ? (
                <select
                  name="societyName"
                  value={profile.societyName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Society</option>
                  {societies.map((society) => (
                    <option key={society._id} value={society.name}>
                      {society.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="societyName"
                  value={profile.societyName}
                  onChange={handleChange}
                  placeholder="Society Name"
                  required
                />
              ))}
            {editMode || createMode ? (
              <button onClick={saveProfile}>
                {createMode ? "Create Profile" : "Save Profile"}
              </button>
            ) : (
              <>
                <button onClick={() => setEditMode(true)}>Edit Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>

        {!createMode && (
          <div className="member-section">
            <h3>Family Members</h3>
            <div className="member-form">
              <input
                name="name"
                value={member.name}
                onChange={handleMemberChange}
                placeholder="Member Name"
                required
              />
              <input
                name="relation"
                value={member.relation}
                onChange={handleMemberChange}
                placeholder="Relation"
                required
              />
              <input
                name="age"
                type="number"
                value={member.age}
                onChange={handleMemberChange}
                placeholder="Age"
                required
              />
              <input
                name="profession"
                value={member.profession}
                onChange={handleMemberChange}
                placeholder="Profession (optional)"
              />
              <input
                name="contact"
                value={member.contact}
                onChange={handleMemberChange}
                placeholder="Contact (optional)"
              />
              <button onClick={addOrUpdateMember}>
                {editingMemberIndex !== null ? "Update Member" : "Add Member"}
              </button>
            </div>

            <div className="members-list">
              {profile.members.length > 0 ? (
                profile.members.map((mem, index) => (
                  <div key={index} className="member-card">
                    <p>
                      <strong>Member Name:</strong> {mem.name}
                    </p>
                    <p>
                      <strong>Relation:</strong> {mem.relation}
                    </p>
                    <p>
                      <strong>Age:</strong> {mem.age}
                    </p>
                    <p>
                      <strong>Profession:</strong> {mem.profession || "N/A"}
                    </p>
                    <p>
                      <strong>Contact:</strong> {mem.contact || "N/A"}
                    </p>
                    <div className="button-container">
                      <button onClick={() => editMember(index)}>Edit</button>
                      <button onClick={() => deleteMember(index)}>Delete</button>
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
