import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddVehicle.css";
import Navbar from "../Navbar/Navbar";
import TabBar from "../TabBar/TabBar";
import AddIcon from "@mui/icons-material/Add";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://entrykart-admin.onrender.com";

const AddVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [vehicleForms, setVehicleForms] = useState([
    {
      ownerName: "",
      flatNumber: "",
      societyName: "",
      vehicleType: "bike",
      vehicleName: "",
      numberPlate: "",
    },
  ]);
  const [editVehicle, setEditVehicle] = useState(null);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({ flatNumber: "", societyName: "", ownerName: "" });

  useEffect(() => {
    const email = localStorage.getItem("ownerEmail");
    if (!email) {
      setError("Please log in to manage vehicles.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/flats/owner-by-email-fallback/${email}`);
        const owner = response.data;
        setProfile({
          flatNumber: owner.flatNumber || "",
          societyName: owner.societyName || "",
          ownerName: owner.ownerName || "",
        });
        setVehicleForms((prev) =>
          prev.map((form) => ({
            ...form,
            flatNumber: owner.flatNumber || "",
            societyName: owner.societyName || "",
            ownerName: owner.ownerName || "",
          }))
        );
      } catch (err) {
        setError("Failed to fetch profile.");
      }
    };

    fetchVehicles();
    fetchProfile();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/vehicles`);
      setVehicles(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch vehicles.");
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/vehicles/search`, {
        params: { query: searchTerm },
      });
      setVehicles(response.data);
      setError("");
    } catch (err) {
      setError("No vehicles found for this search term.");
    }
  };

  const handleFormChange = (index, field, value) => {
    setVehicleForms((prev) =>
      prev.map((form, i) =>
        i === index ? { ...form, [field]: value } : form
      )
    );
  };

  const addVehicleForm = () => {
    setVehicleForms((prev) => [
      ...prev,
      {
        ownerName: profile.ownerName || "",
        flatNumber: profile.flatNumber || "",
        societyName: profile.societyName || "",
        vehicleType: "bike",
        vehicleName: "",
        numberPlate: "",
      },
    ]);
  };

  const removeVehicleForm = (index) => {
    setVehicleForms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("ownerEmail");
    if (!email) {
      setError("Please log in to add vehicles.");
      return;
    }

    try {
      if (editVehicle) {
        const response = await axios.put(`${BASE_URL}/api/vehicles/${editVehicle._id}`, vehicleForms[0]);
        setVehicles(vehicles.map((v) => (v._id === editVehicle._id ? response.data : v)));
        setEditVehicle(null);
        setVehicleForms([
          {
            ownerName: profile.ownerName || "",
            flatNumber: profile.flatNumber || "",
            societyName: profile.societyName || "",
            vehicleType: "bike",
            vehicleName: "",
            numberPlate: "",
          },
        ]);
      } else {
        const response = await axios.post(`${BASE_URL}/api/vehicles`, vehicleForms.map(form => ({
          ...form,
          ownerEmail: email,
        })));
        setVehicles([...vehicles, ...response.data]);
        setVehicleForms([
          {
            ownerName: profile.ownerName || "",
            flatNumber: profile.flatNumber || "",
            societyName: profile.societyName || "",
            vehicleType: "bike",
            vehicleName: "",
            numberPlate: "",
          },
        ]);
      }
      setShowForm(false);
      setError("");
    } catch (err) {
      setError("Failed to save vehicles. Ensure number plates are unique and follow the format (e.g., MH12AB1234).");
    }
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleForms([vehicle]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/vehicles/${id}`);
      setVehicles(vehicles.filter((v) => v._id !== id));
      setError("");
    } catch (err) {
      setError("Failed to delete vehicle.");
    }
  };

  return (
    <div className="add-vehicle-container">
      <Navbar />
      {error && <p className="error-message">{error}</p>}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by flat number, owner name, or vehicle name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-icon" onClick={() => setShowForm(true)} aria-label="Add vehicle">
          <AddIcon />
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="vehicle-form">
          {vehicleForms.map((form, index) => (
            <div key={index} className="vehicle-form-group">
              <h3>Vehicle {index + 1}</h3>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => handleFormChange(index, "ownerName", e.target.value)}
                placeholder="Owner Name"
                required
              />
              <input
                type="text"
                value={form.flatNumber}
                onChange={(e) => handleFormChange(index, "flatNumber", e.target.value)}
                placeholder="Flat Number"
                required
                readOnly
              />
              <input
                type="text"
                value={form.societyName}
                onChange={(e) => handleFormChange(index, "societyName", e.target.value)}
                placeholder="Society Name"
                required
                readOnly
              />
              <select
                value={form.vehicleType}
                onChange={(e) => handleFormChange(index, "vehicleType", e.target.value)}
                required
              >
                <option value="bike">Bike</option>
                <option value="car">Car</option>
              </select>
              <input
                type="text"
                value={form.vehicleName}
                onChange={(e) => handleFormChange(index, "vehicleName", e.target.value)}
                placeholder="Vehicle Name (e.g., Honda Activa)"
                required
              />
              <input
                type="text"
                value={form.numberPlate}
                onChange={(e) => handleFormChange(index, "numberPlate", e.target.value)}
                placeholder="Number Plate (e.g., MH12AB1234)"
                required
                pattern="[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}"
              />
              {vehicleForms.length > 1 && !editVehicle && (
                <button type="button" onClick={() => removeVehicleForm(index)} className="remove-vehicle">
                  Remove Vehicle
                </button>
              )}
            </div>
          ))}
          {!editVehicle && (
            <button type="button" onClick={addVehicleForm} className="add-another-vehicle">
              Add Another Vehicle
            </button>
          )}
          <div className="form-actions">
            <button type="submit">{editVehicle ? "Update" : "Add"} Vehicle(s)</button>
            <button type="button" onClick={() => { setShowForm(false); setEditVehicle(null); setVehicleForms([{
              ownerName: profile.ownerName || "",
              flatNumber: profile.flatNumber || "",
              societyName: profile.societyName || "",
              vehicleType: "bike",
              vehicleName: "",
              numberPlate: "",
            }]); }}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="vehicle-list">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="vehicle-item">
            <p><strong>Owner:</strong> {vehicle.ownerName}</p>
            <p><strong>Flat:</strong> {vehicle.flatNumber}</p>
            <p><strong>Type:</strong> {vehicle.vehicleType}</p>
            <p><strong>Name:</strong> {vehicle.vehicleName}</p>
            <p><strong>Number Plate:</strong> {vehicle.numberPlate}</p>
            {vehicle.flatNumber === profile.flatNumber && (
              <div className="vehicle-actions">
                <button onClick={() => handleEdit(vehicle)}>Edit</button>
                <button onClick={() => handleDelete(vehicle._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <TabBar />
    </div>
  );
};

export default AddVehicle;