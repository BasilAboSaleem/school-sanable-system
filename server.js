// ===========================
// School Sanable System - server.js
// ===========================

require("dotenv").config();
const http = require("http");
const app = require("./app");

// --------- Environment ----------
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// --------- Create HTTP Server ----------
const server = http.createServer(app);

// --------- Start Server ----------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at: ${BASE_URL}`);
});

// --------- Export Server ----------
module.exports = server;
