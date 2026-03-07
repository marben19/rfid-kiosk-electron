import React, { useState } from "react";

export default function Test() {
  const [cardNo, setCardNo] = useState("");
  const [deviceId, setDeviceId] = useState("e2047211-e92d-4c62-895f-25dd48bc9596");
  const [amount, setAmount] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckBalance = async () => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const response = await fetch(
        "https://unfecund-unstretchable-hyacinth.ngrok-free.dev/cardholders/balance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardNo,
            deviceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setResponseData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBalance = async () => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const response = await fetch(
        "https://unfecund-unstretchable-hyacinth.ngrok-free.dev/cardholders/load",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardNo,
            deviceId,
            amount: Number(amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setResponseData(data);
    } catch (err) {
      console.error("Failed to update balance:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>API Card Tester</h2>

        <div style={styles.inputGroup}>
          <label>Card Number</label>
          <input
            type="text"
            value={cardNo}
            onChange={(e) => setCardNo(e.target.value)}
            placeholder="Enter Card UID"
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Device ID</label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Load Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount"
          />
        </div>

        <button onClick={handleCheckBalance} style={styles.button}>
          {loading ? "Checking..." : "Check Balance"}
        </button>

        <button
          onClick={handleLoadBalance}
          style={{ ...styles.button, background: "#3b82f6", marginTop: "10px" }}
        >
          {loading ? "Processing..." : "Load Balance"}
        </button>

        {error && (
          <div style={{ color: "red", marginTop: "15px" }}>
            Error: {error}
          </div>
        )}

        {responseData && (
          <div style={styles.result}>
            <h4>Full Response:</h4>
            <pre>{JSON.stringify(responseData, null, 2)}</pre>

            <h3>Balance: ₱{responseData.balance ?? "N/A"}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "12px",
    width: "400px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
  },
  result: {
    marginTop: "20px",
    background: "#334155",
    padding: "10px",
    borderRadius: "6px",
  },
};