// const http = require("http");
// const socketIO = require("socket.io");
// const socketServerPort = process.env.SOCKET_SERVER_PORT;

module.exports = (io
  // pool, accessControlAllowOrigin

) => {
  // const server = http.createServer(app);

  // const io = socketIO(server, {
  //   cors: {
  //     origin: accessControlAllowOrigin,
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //   },
  // });

  // server.listen(socketServerPort, () => {
  //   console.log(
  //     `Tic Tac Toe socket server running at ${process.env.BACKEND_URL}:${socketServerPort}`
  //   );
  // });

  const allUsers = {};
  const allRooms = [];

  io.on("connection", (socket) => {
    allUsers[socket.id] = {
      socket: socket,
      online: true,
    };
    console.log(allUsers)
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
};
