import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/Topup.css";

export default function Topup() {
  const location = useLocation();
  const navigate = useNavigate();

  const scannedCardNo = location.state?.cardNo;

  const [insertedAmount, setInsertedAmount] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    if (!scannedCardNo) return;

    const fetchBalance = async () => {
      try {
        const response = await fetch(
          "https://unfecund-unstretchable-hyacinth.ngrok-free.dev/cardholders/load",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cardNo: scannedCardNo,
              deviceId: "e2047211-e92d-4c62-895f-25dd48bc9596",
              amount: 0, // just to get current balance
            }),
          }
        );

        const result = await response.json();
        setUserBalance(result.balance ?? 0);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }

      setLoadingBalance(false);
    };

    fetchBalance();

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
                deviceId: "e2047211-e92d-4c62-895f-25dd48bc9596",
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
  }, [scannedCardNo, navigate]);

  return (
    <div className="topup-container">
      <div className="topup-card">
        <h1 className="topup-title">Top-up</h1>
        <p className="topup-subtitle">Insert money into the vending machine</p>

        <div className="topup-display">
          <h2>Card Number</h2>
          <div className="amount-box">{scannedCardNo}</div>
        </div>

        <div className="topup-display">
          <h2>Current Balance</h2>
          <div className="amount-box balance-box">
            {loadingBalance ? "Loading..." : `₱${userBalance}`}
          </div>
        </div>

        <div className="topup-display mt-4">
          <h2>Amount Inserted</h2>
          <div className="amount-box">₱{insertedAmount}</div>
        </div>
      </div>
    </div>
  );
}