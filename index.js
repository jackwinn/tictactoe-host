const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieparser = require("cookie-parser");
const { Pool } = require("pg");
const http = require("http");
const socketIO = require("socket.io");

const appPort = process.env.APP_PORT;
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

// app.listen(4000, (error) => {
//   if (error) {
//     console.log(
//       "An error has occurred, unable to start Tic Tac Toe host",
//       error
//     );
//   } else
//     console.log(
//       `Tic Tac Toe app running at ${process.env.BACKEND_URL}:${appPort}`
//     );
// });

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: accessControlAllowOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

server.listen(appPort, (error) => {
  if (error) {
    console.log("An error occurred, unable to start Tic Tac Toe host", error);
  } else {
    console.log(`Tic Tac Toe app running at ${process.env.BACKEND_URL}:${appPort}`);
  }
});

const allUsers = {};
  const allRooms = [];

  io.on("connection", (socket) => {
    allUsers[socket.id] = {
      socket: socket,
      online: true,
    };
    socket.on("request_to_play", (data) => {
      const currentUser = allUsers[socket.id];
      currentUser.playerName = data.playerName;

      let opponentPlayer;

      for (const key in allUsers) {
        const user = allUsers[key];
        if (user.online && !user.playing && socket.id !== key) {
          opponentPlayer = user;
          break;
        }
      }

      if (opponentPlayer) {
        allRooms.push({
          player1: opponentPlayer,
          player2: currentUser,
        });

        currentUser.socket.emit("OpponentFound", {
          opponentName: opponentPlayer.playerName,
          playingAs: "circle",
        });

        opponentPlayer.socket.emit("OpponentFound", {
          opponentName: currentUser.playerName,
          playingAs: "cross",
        });

        currentUser.socket.on("playerMoveFromClient", (data) => {
          opponentPlayer.socket.emit("playerMoveFromServer", {
            ...data,
          });
        });

        opponentPlayer.socket.on("playerMoveFromClient", (data) => {
          currentUser.socket.emit("playerMoveFromServer", {
            ...data,
          });
        });
      } else {
        currentUser.socket.emit("OpponentNotFound");
      }
    });

    socket.on("disconnect", function () {
      const currentUser = allUsers[socket.id];
      currentUser.online = false;
      currentUser.playing = false;

      for (let index = 0; index < allRooms.length; index++) {
        const { player1, player2 } = allRooms[index];

        if (player1.socket.id === socket.id) {
          player2.socket.emit("opponentLeftMatch");
          break;
        }

        if (player2.socket.id === socket.id) {
          player1.socket.emit("opponentLeftMatch");
          break;
        }
      }
    });
  });


require("./src/services/authService")(app, pool);
require("./src/services/userService")(app, pool);
// require("./src/services/websocketService")(app, pool, io);
