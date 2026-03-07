const winston = require("winston");
const path = require("path");

// Create logs folder automatically
const logDir = path.join(__dirname, "logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// Show logs in console too
logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  })
);

module.exports = logger;