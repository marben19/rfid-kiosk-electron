import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/Topup.css";

export default function Topup() {
  const location = useLocation();
  const navigate = useNavigate();

  const scannedCardNo = location.state?.cardNo;
  // const scannedCardNo = "47B2FE5B";
  const deviceId = "e92b51f6-4683-4844-8395-8d1a4f8849e4";

  const [insertedAmount, setInsertedAmount] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    category: ""
  });

  useEffect(() => {
    if (!scannedCardNo) return;

    // FETCH USER INFO
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `https://unfecund-unstretchable-hyacinth.ngrok-free.dev/cardholders/by-cardno/${scannedCardNo}`,
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true"
            }
          }
        );

        const result = await response.json();

        setUserInfo({
          firstName: result.firstName || "",
          lastName: result.lastName || "",
          category: result.category ?? ""
        });

        setUserBalance(result.balance ?? 0);

      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }

      setLoadingBalance(false);
    };

    fetchUserInfo();

    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "topup_disabled") {
        ws.close();
        navigate("/");
        return;
      }

      if (data.type === "money") {
        const newAmount = Number(data.amount);
        if (isNaN(newAmount)) return;

        setInsertedAmount((prev) => prev + newAmount);

        try {
          const response = await fetch(
            "https://unfecund-unstretchable-hyacinth.ngrok-free.dev/cardholders/load",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cardNo: scannedCardNo,
                deviceId: deviceId,
                amount: newAmount,
              }),
            }
          );

          const result = await response.json();
          setUserBalance(result.balance ?? 0);

        } catch (err) {
          console.error("Failed to update balance:", err);
        }
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => ws.close();
  }, [scannedCardNo, navigate, deviceId]);

  return (
    <div className="topup-container">
      <div className="topup-card">

        <h1 className="topup-title">Top-up</h1>
        <p className="topup-subtitle">Insert money into the vending machine</p>

        {/* USER INFO */}
        <div className="user-info">
          <h2 className="user-name">
            {userInfo.firstName} {userInfo.lastName}
          </h2>

          <div className="user-category">
            Category: {userInfo.category}
          </div>
        </div>

        <div className="topup-display">
          <h2>Card Number</h2>
          <div className="amount-box">{scannedCardNo}</div>
        </div>

        <div className="topup-row">
          <div className="topup-display">
            <h2>Current Balance</h2>
            <div className="amount-box balance-box">
              {loadingBalance ? "Loading..." : `₱${userBalance}`}
            </div>
          </div>

          <div className="topup-display">
            <h2>Amount Inserted</h2>
            <div className="amount-box">₱{insertedAmount}</div>
          </div>
        </div>

      </div>
    </div>
  );
}