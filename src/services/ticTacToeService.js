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

        // console.log('Game Matched')
        // console.log(allRooms)

        // console.log("user playing");
        // console.log(allUsers);

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

        currentUser.socket.on("rechallengeRequestedFromClient", (data) => {
          opponentPlayer.socket.emit("rechallengeRequestedFromServer", {
            rechallengeConfimation: true,
          });
        });

        opponentPlayer.socket.on("rechallengeRequestedFromClient", (data) => {
          currentUser.socket.emit("rechallengeRequestedFromServer", {
            rechallengeConfimation: true,
          });
        });

        currentUser.socket.on("rechallengeAcceptedFromClient", (data) => {
          opponentPlayer.socket.emit("rechallengeAcceptedFromServer", {
            rechallengeConfirmed: true,
          });
        });

        opponentPlayer.socket.on("rechallengeAcceptedFromClient", (data) => {
          currentUser.socket.emit("rechallengeAcceptedFromServer", {
            rechallengeConfirmed: true,
          });
        });

        currentUser.socket.on("rechallengeDeclinedFromClient", (data) => {
          opponentPlayer.socket.emit("rechallengeDeclinedFromServer", {
            rechallengeDeclined: true,
          });
        });

        opponentPlayer.socket.on("rechallengeDeclinedFromClient", (data) => {
          currentUser.socket.emit("rechallengeDeclinedFromServer", {
            rechallengeDeclined: true,
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

      // console.log("currentUser")
      // console.log(currentUser)

      for (let i = 0; i < allRooms.length; i++) {
        const { player1, player2 } = allRooms[i];

        // console.log(player1, player2);

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

      // console.log('Game Disconnect')
      // console.log(allRooms)
    });
  });
};
