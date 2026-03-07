// backend.js
const express = require("express");
const { SerialPort } = require("serialport");
const cors = require("cors");
const logger = require("./logger");
const WebSocket = require("ws");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// =============================
// WEBSOCKET SERVER
// =============================
const wss = new WebSocket.Server({ port: 8080 });
logger.info("WebSocket server running on ws://localhost:8080");

// Broadcast helper
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// WebSocket connection logging
wss.on("connection", (ws) => {
  logger.info("WebSocket client connected");
  ws.send(JSON.stringify({ type: "info", message: "Connected to backend WS" }));
});

// =============================
// SERIAL PORT CONFIG
// =============================
let espPort;

espPort = new SerialPort({
  path: "/dev/ttyAMA0", // replace with your ESP32 port
  baudRate: 9600,
});

// When serial port opens
espPort.on("open", () => {
  logger.info("ESP32 Serial Port Connected");
});

// Handle incoming data from ESP32
espPort.on("data", (data) => {
  const message = data.toString().trim();
  logger.info(`ESP32 Data: ${message}`);
  console.log("📥 Data received from ESP32:", message);

  // Card UID detected
  if (message.startsWith("UID_")) {
    const uid = message.replace("UID_", "").trim();
    logger.info(`Card Scanned UID: ${uid}`);
    broadcast({ type: "card_uid", uid });
    return;
  }

  // Money inserted (only if numeric)
  const amount = Number(message);

  if (!isNaN(amount)) {
    logger.info(`Money Inserted: ₱${amount}`);
    broadcast({ type: "money", amount });
    return;
  }

  // Other ESP messages
  if (message === "TOPUP_EN") {
    broadcast({ type: "topup_enabled" });
  }

  if (message === "TOPUP_CLOSED") {
    broadcast({ type: "topup_disabled" });
  }

  if (message === "PUP_DISABLED") {
    broadcast({ type: "topup_disabled" });
  }

  if (message === "CARD_EN") {
    broadcast({ type: "card_enabled" });
  }

  if (message === "CARD_DIS") {
    broadcast({ type: "card_disabled" });
  }
});

// Handle serial errors
espPort.on("error", (err) => {
  console.error("SerialPort Error:", err.message);
  logger.error(`SerialPort Error: ${err.message}`);
});

// =============================
// ROUTES
// =============================

app.get("/stop-card", (req, res) => {
  if (!espPort) return res.status(500).json({ error: "ESP32 not connected" });

  espPort.write("CARD_DIS\n", (err) => {
    if (err) {
      logger.error(`Failed to send CARD_EN: ${err.message}`);
      return res.status(500).json({ error: "Failed to send CARD_EN" });
    }
    logger.info("CARD_DIS command sent to ESP32");
    res.json({ message: "CARD_DIS sent" });
  });
});


app.get("/start-card", (req, res) => {
  if (!espPort) return res.status(500).json({ error: "ESP32 not connected" });

  espPort.write("CARD_EN\n", (err) => {
    if (err) {
      logger.error(`Failed to send CARD_EN: ${err.message}`);
      return res.status(500).json({ error: "Failed to send CARD_EN" });
    }
    logger.info("CARD_EN command sent to ESP32");
    res.json({ message: "CARD_EN sent" });
  });
});


app.get("/start-scan", (req, res) => {
  if (!espPort) return res.status(500).json({ error: "ESP32 not connected" });
  console.log("Received request to start scan");
  espPort.write("TOPUP_EN\n", (err) => {
    if (err) {
      logger.error(`Failed to send CARD_EN: ${err.message}`);
      return res.status(500).json({ error: "Failed to send CARD_EN" });
    }
    logger.info("CARD_EN command sent to ESP32");
    res.json({ message: "CARD_EN sent" });
  });
});

app.get("/start-scan-mock", (req, res) => {
  logger.info("CARD_EN simulated (mock)");
  res.json({ message: "CARD_EN simulated (mock)" });
});

// =============================
// GLOBAL ERROR HANDLER
// =============================
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.stack}`);
  res.status(500).json({ error: "Something went wrong" });
});

// =============================
app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`);
});