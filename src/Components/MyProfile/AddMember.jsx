import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AddMember.css";
import TabBar from "../TabBar/TabBar";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://backend-clr8.onrender.com" ; // deployment url

const AddMember = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { initialMember, editingMemberIndex } = state || {};

  const [member, setMember] = useState(
    initialMember || {
      name: "",
      relation: "",
      age: "",
      profession: "",
      contact: "",
    }
  );
  const [familyMembers, setFamilyMembers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const email = localStorage.getItem("ownerEmail");
      if (!email) {
        setError("Please log in to manage family members.");
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
        );
        const owner = response.data;
        if (owner && Array.isArray(owner.familyMembers)) {
          setFamilyMembers(owner.familyMembers);
        } else {
          setFamilyMembers([]);
        }
      } catch (err) {
        setError("Failed to fetch family members. Please try again later.");
      }
    };
    fetchFamilyMembers();
  }, []);

  useEffect(() => {
    console.log("Member state:", member); // Debug state updates
  }, [member]);

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  const validateMember = () => {
    if (!member.name) return "Member name is required.";
    if (!member.relation) return "Relation is required.";
    if (!member.age) return "Age is required.";
    if (Number(member.age) <= 0) return "Age must be a positive number.";
    if (member.contact && !/^\d{10}$/.test(member.contact))
      return "Contact number must be a valid 10-digit number.";
    return "";
  };

  const addOrUpdateMember = async () => {
    const validationError = validateMember();
    if (validationError) {
      throw new Error(validationError);
    }

    const email = localStorage.getItem("ownerEmail");
    if (!email) {
      throw new Error("Please log in to manage family members.");
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/api/flats/owner-by-email-fallback/${email}`
      );
      const owner = response.data;

      if (!owner || !owner._id) {
        throw new Error("Please create your profile first.");
      }

      const memberData = {
        name: member.name,
        relation: member.relation,
        age: Number(member.age),
        profession: member.profession || "",
        contact: member.contact || "",
      };

      let updatedMembers;
      let apiResponse;

      if (editingMemberIndex !== null && editingMemberIndex !== undefined && editingMemberIndex >= 0) {
        updatedMembers = [...familyMembers];
        updatedMembers[editingMemberIndex] = memberData;
        apiResponse = await axios.put(
          `${BASE_URL}/api/flats/owner/${owner._id}/edit-family/${editingMemberIndex}`,
          memberData
        );
      } else {
        updatedMembers = [...familyMembers, memberData];
        apiResponse = await axios.put(
          `${BASE_URL}/api/flats/owner/${owner._id}/add-family`,
          memberData
        );
      }

      if (apiResponse.data && Array.isArray(apiResponse.data.familyMembers)) {
        setFamilyMembers(apiResponse.data.familyMembers);
      } else {
        setFamilyMembers(updatedMembers);
      }

      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Error adding/updating member. Please try again.";
      throw new Error(errorMessage);
    }
  };

  const handleAddAnother = async () => {
    try {
      const success = await addOrUpdateMember();
      if (success) {
        setMember({
          name: "",
          relation: "",
          age: "",
          profession: "",
          contact: "",
        });
        setError("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      const success = await addOrUpdateMember();
      if (success) {
        navigate("/my-profile");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>

      <div className="add-member-container">
        <div className="add-member-header">
          <h2>{editingMemberIndex !== null && editingMemberIndex !== undefined ? "Edit Family Member" : "Add Family Member"}</h2>
          <p>Manage your family information</p>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="add-member-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={member.name}
              onChange={handleMemberChange}
              placeholder="Enter full name"
              className="form-input"
              aria-label="Full name"
              data-debug="editable"
            />
          </div>
          <div className="form-group">
            <label htmlFor="relation">Relation</label>
            <select
              id="relation"
              name="relation"
              value={member.relation}
              onChange={handleMemberChange}
              className="select-input"
              aria-label="Relation"
            >
              <option value="" disabled>Select relation</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              name="age"
              value={member.age}
              onChange={handleMemberChange}
              placeholder="Enter age"
              className="form-input"
              aria-label="Age"
              min="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="profession">Profession (Optional)</label>
            <input
              id="profession"
              type="text"
              name="profession"
              value={member.profession}
              onChange={handleMemberChange}
              placeholder="Enter profession"
              className="form-input"
              aria-label="Profession"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact Number (Optional)</label>
            <input
              id="contact"
              type="text"
              name="contact"
              value={member.contact}
              onChange={handleMemberChange}
              placeholder="Enter contact number"
              className="form-input"
              aria-label="Contact number"
              maxLength="10"
            />
          </div>
          <div className="form-buttons">
            <button
              onClick={handleAddAnother}
              className="add-another-button"
              aria-label="Add another family member"
            >
              Add Another
            </button>
            <button
              onClick={handleSave}
              className="save-button"
              aria-label="Save family member"
            >
              Save
            </button>
          </div>
        </div>
        {familyMembers.length > 0 && (
          <div className="family-members-list">
            <h3>Family Members</h3>
            {familyMembers.map((famMember, index) => (
              <div key={index} className="family-member-card">
                <div className="member-info">
                  <span className="member-name">{famMember.name || "Unknown"}</span>
                  <span className="member-age-profession">
                    Age: {famMember.age || "N/A"}
                    {famMember.profession ? ` • ${famMember.profession}` : ""}
                  </span>
                  {famMember.contact && (
                    <span className="member-contact">Contact: {famMember.contact}</span>
                  )}
                </div>
                <div className="member-details">
                  <span className="member-relation">{famMember.relation || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </>
  );
};

export default AddMember;