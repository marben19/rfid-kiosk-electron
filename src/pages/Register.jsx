import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserPlus, FaIdCard } from "react-icons/fa";
import Swal from "sweetalert2";
import "./css/Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    address: "",
    email: "",
    birthday: "",
    age: "",
    idType: "REGULAR",
    contact: "",
    card_uid: "", // dummy card number
  });

  // AUTO CALCULATE AGE
  useEffect(() => {
    if (formData.birthday) {
      const today = new Date();
      const birthDate = new Date(formData.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setFormData((prev) => ({
        ...prev,
        age: age >= 0 ? age : "",
      }));
    }
  }, [formData.birthday]);

  useEffect(() => {
    const startCardScan = async () => {
        try {
        console.log("Starting card scan...");

        const response = await fetch("http://localhost:3001/start-card");

        if (!response.ok) {
            throw new Error("Failed to start card scan");
        }

        const data = await response.json();
        console.log("Scan started:", data);
        } catch (error) {
        console.error("Error starting card scan:", error);
        }
    };

    startCardScan();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connected for card scan");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "card_uid") {
          console.log("Card UID received:", data.uid);

          setFormData((prev) => ({
            ...prev,
            card_uid: data.uid,
          }));

          Swal.fire({
            icon: "success",
            title: "Card Detected",
            text: `UID: ${data.uid}`,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => ws.close();
  }, []);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map ID Type to userCategory integer
    const categoryMap = {
      REGULAR: 0,
      PWD: 1,
      STUDENT: 2,
      SENIOR: 3,
    };

    // Prepare new API payload
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.contact,
      address: formData.address,
      cardNo: formData.card_uid,
      birthDate: formData.birthday ? new Date(formData.birthday).toISOString() : null,
      userCategory: formData.idType,
    };

    try {
      // Show loader
      Swal.fire({
        title: "Registering...",
        text: "Please wait",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      const response = await fetch(
        "https://unfecund-unstretchable-hyacinth.ngrok-free.dev/cardholders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to register card");

      const data = await response.json();
      console.log("Response:", data);

      Swal.fire({
        icon: "success",
        title: "Registered!",
        text: "Card Registered Successfully!",
      });

      navigate("/"); // go back to kiosk screen
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to register card. Please try again.",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        {/* LEFT PANEL */}
        <div className="register-left">
          <h1>Register RFID Card</h1>
          <p>Create a new user profile and link RFID card</p>
          <div className="rfid-status">
            <FaIdCard size={22} />
            <span>Waiting for card scan...</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="register-card">
          <button className="back-button" onClick={() => navigate("/")}>
            <FaArrowLeft />
          </button>

          <h2 className="form-title">
            <FaUserPlus /> New Registration
          </h2>

          <form onSubmit={handleSubmit} className="register-form">
            {/* NAME ROW */}
            <div className="row-group">
              <div className="input-group">
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <label>Last Name</label>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <label>First Name</label>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="middleInitial"
                  value={formData.middleInitial}
                  onChange={handleChange}
                />
                <label>M.O</label>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="input-group">
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
              />
              <label>Address</label>
            </div>

            {/* EMAIL */}
            <div className="input-group">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <label>E-mail</label>
            </div>

            {/* BIRTHDAY + AGE */}
            <div className="row-group">
              <div className="input-group">
                <input
                  type="date"
                  name="birthday"
                  required
                  value={formData.birthday}
                  onChange={handleChange}
                />
                <label>Birthday</label>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                />
                <label>Age</label>
              </div>
            </div>

            {/* ID TYPE */}
            <div className="input-group">
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="modern-select"
              >
                <option value="REGULAR">Regular</option>
                <option value="PWD">PWD</option>
                <option value="STUDENT">Student</option>
                <option value="SENIOR">Senior</option>
              </select>
              <label className="select-label">ID Type</label>
            </div>

            {/* CONTACT */}
            <div className="input-group">
              <input
                type="text"
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
              />
              <label>Contact Number</label>
            </div>

            {/* CARD UID */}
            <div className="input-group">
              <input
                type="text"
                name="card_uid"
                required
                value={formData.card_uid}
                onChange={handleChange}
                readOnly
              />
              <label>Card UID</label>
            </div>

            <button type="submit" className="register-btn">
              Register Card
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}