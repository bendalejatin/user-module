import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import "./EntryPermissionForm.css";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://entrykart-admin.onrender.com"; // deployment url

const EntryPermissionForm = () => {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState("");
  const [society, setSociety] = useState("");
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState("");
  const [flats, setFlats] = useState([]);
  const [flatNumber, setFlatNumber] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [visitorType, setVisitorType] = useState("");
  const [status, setStatus] = useState("pending");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false); // New state to toggle form visibility

  const [userProfile, setUserProfile] = useState({
    societyName: "",
    flatNumber: "",
    email: "",
    societyId: "",
  });

  const userEmail = localStorage.getItem("ownerEmail");
  const superadminEmail = "dec@gmail.com";

  useEffect(() => {
    if (!userEmail) {
      setError("Please log in to access entry permissions.");
      setLoading(false);
      return;
    }

    fetchUserProfile();
    fetchSocieties();
    fetchUsers();
    fetchEntries();
    checkExpiringPermissions();
  }, [userEmail]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/flats/owner-by-email-fallback/${userEmail}`);
      const owner = response.data;
      if (owner && owner._id) {
        setUserProfile({
          societyName: owner.societyName || "",
          flatNumber: owner.flatNumber || "",
          email: owner.email || "",
          societyId: owner.societyId || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    if (societies.length > 0 && userProfile.societyName) {
      autoFillUserDetails();
    }
  }, [societies, userProfile]);

  const autoFillUserDetails = () => {
    const userSociety = societies.find(
      (soc) => soc.name.toLowerCase() === userProfile.societyName.toLowerCase()
    );
    if (userSociety) {
      setSelectedSociety(userSociety._id);
      setSociety(userSociety.name);
      setFlats(userSociety.flats || []);
      if (userProfile.flatNumber && userSociety.flats && userSociety.flats.includes(userProfile.flatNumber)) {
        setFlatNumber(userProfile.flatNumber);
      }
      if (userProfile.email) {
        setEmail(userProfile.email);
      }
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/societies?email=${superadminEmail}`);
      setSocieties(response.data);
    } catch (error) {
      console.error("Error fetching societies:", error);
      setError("Failed to fetch societies.");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users?email=${superadminEmail}`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch user data.");
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/entries?email=${superadminEmail}`);
      setEntries(response.data);
    } catch (err) {
      console.error("Error fetching entries:", err);
      toast.error("Failed to fetch entries");
    }
  };

  const checkExpiringPermissions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/entries/expiring-soon`);
      if (res.data.length > 0) {
        res.data.forEach((entry) => {
          toast.warn(`Permission for ${entry.name} is expiring soon!`);
        });
      }
    } catch (error) {
      console.error("Error checking expiring permissions:", error);
    }
  };

  const handleSocietyChange = (societyId) => {
    setSelectedSociety(societyId);
    const society = societies.find((soc) => soc._id === societyId);
    setFlats(society ? society.flats : []);
    setFlatNumber("");
    setEmail("");
    setSociety(society ? society.name : "");
  };

  const handleFlatChange = (flatNo) => {
    setFlatNumber(flatNo);
    const user = users.find(
      (user) => user.flatNumber === flatNo && user.society && user.society._id === selectedSociety
    );
    setEmail(user ? user.email : "");
  };

  const handleSave = async () => {
    if (!name || !selectedSociety || !flatNumber || !visitorType || !description || !dateTime || !expiry || !status) {
      toast.error("All fields are required");
      return;
    }

    if (!userEmail) {
      toast.error("User email is missing. Please log in.");
      return;
    }

    const entryDate = new Date(dateTime);
    const expiryDate = new Date(expiry);
    if (entryDate >= expiryDate) {
      toast.error("Expiry date must be after entry date");
      return;
    }

    const expirationDate = new Date(dateTime);
    expirationDate.setDate(expirationDate.getDate() + 7);

    try {
      const payload = {
        name: name.trim(),
        flatNumber: flatNumber.trim(),
        dateTime,
        description: description.trim(),
        additionalDateTime: expiry,
        expirationDateTime: expirationDate,
        email,
        visitorType,
        status,
        societyId: selectedSociety,
        adminEmail: userEmail,
      };

      const res = await axios.post(`${BASE_URL}/api/entries`, payload);
      setEntries([...entries, res.data]);
      toast.success("Entry added successfully!");
      resetForm();
      setShowForm(false); // Hide form after saving
    } catch (error) {
      console.error("Error saving entry:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Error saving entry: " + error.message);
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      await axios.put(`${BASE_URL}/api/entries/${id}`, payload);
      setEntries(entries.map((entry) => (entry._id === id ? { ...entry, status: newStatus } : entry)));
      toast.success(`Entry ${newStatus} successfully!`);
    } catch (error) {
      console.error(`Error updating entry status to ${newStatus}:`, error);
      toast.error(`Error updating entry status: ${error.response?.data?.message || error.message}`);
    }
  };

  const getSocietyId = (societyIdValue) => {
    return typeof societyIdValue === "string" ? societyIdValue : societyIdValue?._id || "";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/entries/${id}`);
      setEntries(entries.filter((entry) => entry._id !== id));
      toast.success("Entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Error deleting entry: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setName("");
    setVisitorType("");
    setStatus("pending");
    setDescription("");
    setDateTime("");
    setExpiry("");
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.visitorType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">
          <h2>Loading...</h2>
        </div>
        <TabBar />
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="entry-form-container">
        <Navbar />
        <div className="entry-card">
          <p>{error}</p>
        </div>
        <TabBar />
        <ToastContainer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="entry-form-container">
        <div className="entry-card">
          <div className="form-title">My Entry Permissions</div>
          <div className="entry-form-content">
            <div className="add-entry-button-container">
              <button
                type="button"
                className="submit-btn allow-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "Add Entry"}
              </button>
            </div>

            {showForm && (
              <form className="entry-form" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="name">Visitor Name *</label>
                <input
                  type="text"
                  id="name"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Visitor Name"
                  required
                />

                <label htmlFor="society">Society *</label>
                <select
                  id="society"
                  className="input-field select-field"
                  value={selectedSociety}
                  onChange={(e) => handleSocietyChange(e.target.value)}
                  required
                >
                  <option value="">Select Society</option>
                  {societies.map((society) => (
                    <option key={society._id} value={society._id}>
                      {society.name}
                    </option>
                  ))}
                </select>

                <label htmlFor="flat-number">Flat Number *</label>
                <select
                  id="flat-number"
                  className="input-field select-field"
                  value={flatNumber}
                  onChange={(e) => handleFlatChange(e.target.value)}
                  disabled={!selectedSociety}
                  required
                >
                  <option value="">Select Flat</option>
                  {flats.map((flat) => (
                    <option key={flat} value={flat}>
                      {flat}
                    </option>
                  ))}
                </select>

                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  value={email}
                  readOnly
                  placeholder="Email"
                />

                <label htmlFor="visitor-type">Visitor Type *</label>
                <select
                  id="visitor-type"
                  className="input-field select-field"
                  value={visitorType}
                  onChange={(e) => setVisitorType(e.target.value)}
                  required
                >
                  <option value="">-- Select Visitor Type --</option>
                  <option value="Guest">Guest</option>
                  <option value="Swiggy/Zomato">Swiggy/Zomato</option>
                  <option value="Maid">Maid</option>
                  <option value="Other">Other</option>
                </select>

                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  className="input-field select-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </select>

                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                  rows="3"
                  required
                />

                <label htmlFor="datetime">Date & Time *</label>
                <input
                  type="datetime-local"
                  id="datetime"
                  className="input-field"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                />

                <label htmlFor="expiry">Expiry Date & Time *</label>
                <input
                  type="datetime-local"
                  id="expiry"
                  className="input-field"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />

                <div className="decision-buttons">
                  <button type="button" className="submit-btn allow-btn" onClick={handleSave}>
                    Add Entry
                  </button>
                </div>
              </form>
            )}

            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field search-input"
            />

            <div className="entries-list">
              {filteredEntries.length === 0 ? (
                <p>No entry permissions found.</p>
              ) : (
                filteredEntries.map((entry) => (
                  <div key={entry._id} className="entry-item">
                    <div className="entry-details">
                      <h4>{entry.name}</h4>
                      <p>
                        <strong>Society:</strong>{" "}
                        {societies.find((soc) => soc._id === getSocietyId(entry.societyId))?.name || "N/A"}
                      </p>
                      <p><strong>Flat Number:</strong> {entry.flatNumber}</p>
                      <p><strong>Email:</strong> {entry.email || "N/A"}</p>
                      <p><strong>Visitor Type:</strong> {entry.visitorType}</p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className={`status ${entry.status}`}>
                          {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1)}
                        </span>
                      </p>
                      <p><strong>Description:</strong> {entry.description}</p>
                      <p>
                        <strong>Date & Time:</strong> {new Date(entry.dateTime).toLocaleString()}
                      </p>
                      <p>
                        <strong>Expiry:</strong> {new Date(entry.additionalDateTime).toLocaleString()}
                      </p>
                    </div>
                    {entry.status === "pending" && (
                      <div className="entry-actions">
                        <button
                          className="submit-btn allow-btn"
                          onClick={() => handleStatusUpdate(entry._id, "allow")}
                        >
                          Allow
                        </button>
                        <button
                          className="submit-btn deny-btn"
                          onClick={() => handleStatusUpdate(entry._id, "deny")}
                        >
                          Deny
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(entry._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <TabBar />
      <ToastContainer />
    </>
  );
};

export default EntryPermissionForm;