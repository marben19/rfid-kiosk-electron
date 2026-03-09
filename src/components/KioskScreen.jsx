import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaWallet, FaPlusCircle, FaIdBadge, FaExpand, FaCompress } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import "./KioskScreen.css";

export default function KioskScreen() {
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const navigate = useNavigate();
  const wsRef = useRef(null);

  // device ID from .env
  const deviceId = process.env.REACT_APP_DEVICE_ID;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // ===============================
  // TOP-UP BUTTON
  // ===============================
  const handleTopupClick = async () => {
    setShowTopupModal(true);
    // navigate("/topup");
    // Start card scan
    await fetch("http://localhost:3001/start-scan")
      .then((res) => res.json())
      .catch(console.error);

    // Open WebSocket
    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "card_uid") {
        console.log("Card scanned:", data.uid);

        // Close modal
        setShowTopupModal(false);

        // Close websocket
        wsRef.current.close();

        // Redirect to topup page
        navigate("/topup", { state: { cardNo: data.uid } });
      }
    };
  };

  // ===============================
  // STOP CARD SCAN WHEN MAIN PAGE LOADS
  // ===============================
  useEffect(() => {
    const stopCard = async () => {
      try {
        await fetch("http://localhost:3001/stop-card");
        console.log("Card scanning disabled");
      } catch (error) {
        console.error("Failed to stop card scanning", error);
      }
    };

    const stopScan = async () => {
      try {
        await fetch("http://localhost:3001/stop-scan");
        console.log("Top-up disabled");
      } catch (error) {
        console.error("Failed to stop top-up", error);
      }
    };

    stopCard();
    stopScan();
  }, []);
  // ===============================
  // BALANCE BUTTON
  // ===============================
  const handleBalanceClick = async () => {
    setShowBalanceModal(true);

    await fetch("http://localhost:3001/start-scan")
      .then((res) => res.json())
      .catch(console.error);

    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "card_uid") {
        wsRef.current.close();
        setShowBalanceModal(false);

        try {
          const response = await fetch(
            "https://unfecund-unstretchable-hyacinth.ngrok-free.dev/cardholders/balance",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cardNo: data.uid,
                deviceId: deviceId,
              }),
            }
          );

          const result = await response.json();

          Swal.fire({
            icon: "success",
            title: "Balance Retrieved!",
            text: `Your balance is: ₱${result.balance ?? 0}`,
          });
        } catch (error) {
          console.error(error);

          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to retrieve balance.",
          });
        }
      }
    };
  };

  // ===============================
  // REGISTER BUTTON
  // ===============================
  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="kiosk-container">
      {/* Fullscreen button (optional) */}
      {/* 
      <button className="fullscreen-btn" onClick={toggleFullscreen}>
        {isFullscreen ? <FaCompress size={22} /> : <FaExpand size={22} />}
      </button>
      */}

      <div className="kiosk-content">
        <h1 className="kiosk-title">Pidgeon Smart Kiosk</h1>
        <p className="kiosk-subtitle">Tap your card to begin</p>

        <div className="kiosk-buttons">
          <div className="kiosk-card blue" onClick={handleBalanceClick}>
            <FaWallet size={55} />
            <span>Balance</span>
          </div>

          <div className="kiosk-card green" onClick={handleTopupClick}>
            <FaPlusCircle size={55} />
            <span>Top-up</span>
          </div>

          <div className="kiosk-card orange" onClick={handleRegisterClick}>
            <FaIdBadge size={55} />
            <span>Register</span>
          </div>
        </div>
      </div>

      {/* Top-up Modal */}
      <Modal
        show={showTopupModal}
        onHide={() => setShowTopupModal(false)}
        centered
        contentClassName="dark-modal"
      >
        <Modal.Body className="text-center">
          <h4 className="scan-title">Scan Your Card</h4>
          <div className="scanner-animation mx-auto mt-4"></div>
        </Modal.Body>
      </Modal>

      {/* Balance Modal */}
      <Modal
        show={showBalanceModal}
        onHide={() => setShowBalanceModal(false)}
        centered
        contentClassName="dark-modal"
      >
        <Modal.Body className="text-center">
          <h4 className="scan-title">Scan Your Card</h4>
          <div className="scanner-animation mx-auto mt-4"></div>
        </Modal.Body>
      </Modal>
    </div>
  );
}