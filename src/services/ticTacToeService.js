module.exports = (io) => {
  const allUsers = {};
  const allRooms = [];

  io.on("connection", (socket) => {
    // console.log("socket");
    // console.log(socket.id);

    allUsers[socket.id] = {
      socket: socket,
      online: true,
      playing: false,
    };

    socket.on("request_to_play", (data) => {
      let currentUser = allUsers[socket.id];
      currentUser.playerName = data.playerName;

      let opponentPlayer;
      // console.log("user joined");
      // console.log(allUsers);

      for (const key in allUsers) {
        // console.log("key")
        // console.log(key)
        const user = allUsers[key];
        if (user.online && !user.playing && socket.id !== key) {
          opponentPlayer = user;
          break;
        }
      }

      if (opponentPlayer) {
        opponentPlayer.playing = true;
        currentUser.playing = true;

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

      if (currentUser) {
        currentUser.online = false;
        currentUser.playing = false;
      }

      for (let i = 0; i < allRooms.length; i++) {
        const { player1, player2 } = allRooms[i];

        if (player1.socket.id === socket.id) {
          if (player2?.socket) {
            player2.socket.emit("opponentLeftMatch");
          }
          allRooms.splice(i, 1);
          break;
        }

        if (player2.socket.id === socket.id) {
          if (player1?.socket) {
            player1.socket.emit("opponentLeftMatch");
          }
          allRooms.splice(i, 1);
          break;
        }
      }

      // console.log("user left");
      // console.log(allUsers);
    });
  });
};
