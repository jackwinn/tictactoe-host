const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieparser = require("cookie-parser");
const { Pool } = require("pg");
const http = require("http");
const socketIO = require("socket.io");

const appPort = process.env.APP_PORT;
const socketServerPort = process.env.SOCKET_SERVER_PORT;
const accessControlAllowOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
const app = express();

app.use(cors({ origin: accessControlAllowOrigin, credentials: true }));
app.use(cookieparser());
app.use(express.json());
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", accessControlAllowOrigin);

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST", "OPTIONS");

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Pass to next layer of middleware
  next();
});

//it helps to obscure information about the server and framework being used by
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.end("Hello from Tic Tac Toe host");
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("Pool connected at:", res.rows[0].now);
  })
  .catch((err) => {
    console.error("Pool connection error:", err);
  });

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: accessControlAllowOrigin, // Update with your React app's URL
    methods: ["GET", "POST"],
  },
});

require("./src/services/authService")(app, pool);
require("./src/services/userService")(app, pool);

app.listen(appPort, (error) => {
  if (error) {
    console.log(
      "An error has occurred, unable to start Tic Tac Toe host",
      error
    );
  } else console.log(`Tic Tac Toe app running at http://localhost:${appPort}`);
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("makeMove", (data) => {
    console.log(`data: ${data}`);
    io.emit("moveMade", data);
  });

  socket.on("resetGame", (newGame) => {
    console.log(`newGame: ${newGame}`);
    io.emit("gameReset", newGame);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(socketServerPort, () => {
  console.log(
    `Tic Tac Toe socket server running at http://localhost:${socketServerPort}`
  );
});
