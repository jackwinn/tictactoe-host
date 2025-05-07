const libs = require("../libs/httpAuth");

module.exports = (app) => {
  const posts = [
    {
      username: "Kyle",
      title: "Post 1",
    },
    {
      username: "Jim",
      title: "Post 2",
    },
  ];

  app.get("/users/me", libs.authenticateToken, (req, res) => {
    res.json("IS ME MARIO");
  });
};


