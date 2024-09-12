const { PORT } = require("./config/serverConfig");
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const Redis = require("ioredis");

const redisCache = new Redis();
console.log("Redis cache initialized.");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New User Connected:", socket.id);

  socket.on("setUserId", async (userId) => {
    await redisCache.set(userId, socket.id);
    console.log(
      "Successfully Mapped User Id:",
      userId,
      "To Socket:",
      socket.id
    );
  });

  socket.on("disconnect", async () => {
    console.log("User Disconnected:", socket.id);
  });
});

app.post("/sendPayload", async (req, res) => {
  const { userId, payload } = req.body;
  console.log("Received payload request for userId:", userId);

  if (!userId || !payload) {
    console.log("Invalid request received.");
    return res.status(400).json({
      success: false,
      message: "Invalid Request",
    });
  }

  const socketId = await redisCache.get(userId);
  if (!socketId) {
    console.log("Connection not found for userId:", userId);
    return res.status(404).json({
      success: false,
      message: "Connection Not Found",
    });
  }

  io.to(socketId).emit("submissionPayloadResponse", payload);
  console.log("Payload sent to userId:", userId);

  return res.status(200).json({
    success: true,
    message: "Payload Sent To User Successfully",
  });
});

server.listen(PORT, () => {
  console.log(`Server Is Up At Port ${PORT}`);
});
