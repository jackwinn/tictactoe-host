const jwt = require("jsonwebtoken");
const libs = require("../libs/httpAuth");

module.exports = (app) => {
  const userCredentials = {
    email: "admin@gmail.com",
    password: "admin123",
  };

  app.post("/auths/login", (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
    if (
      email === userCredentials.email &&
      password === userCredentials.password
    ) {
      //creating a access token
      const accessToken = jwt.sign(
        {
          email: userCredentials.email,
          password: userCredentials.password,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );
      // Creating refresh token not that expiry of refresh
      //token is greater than the access token

      const refreshToken = jwt.sign(
        {
          email: userCredentials.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // Assigning refresh token in http-only cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({ accessToken });
    } else {
      // Return unauthorized error if credentials don't match
      return res.status(406).json({
        message: "Invalid credentials",
      });
    }
  });

  app.post("/auths/refresh", (req, res) => {
    if (req.cookies?.jwt) {
      // Destructuring refreshToken from cookie
      const refreshToken = req.cookies.jwt;
      //   console.log(refreshToken);
      // Verifying refresh token
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) {
            // Wrong Refesh Token
            return res.status(406).json({ message: "Unauthorized" });
          } else {
            // Correct token we send a new access token
            const accessToken = jwt.sign(
              {
                email: userCredentials.email,
                password: userCredentials.password,
              },
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "10m",
              }
            );
            return res.json({ accessToken });
          }
        }
      );
    } else {
      return res.status(406).json({ message: "Unauthorized" });
    }
  });

  //   let refreshTokens = [];

  //   app.post("auths/refresh/token", (req, res) => {
  //     const refreshToken = req.body.token;
  //     if (refreshToken == null) return res.sendStatus(401);
  //     if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  //     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
  //       if (err) return res.sendStatus(403);
  //       const accessToken = libs.generateAccessToken({ name: user.name });
  //       res.json({ accessToken: accessToken });
  //     });
  //   });

  //   app.delete("auths/logout", (req, res) => {
  //     refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  //     res.sendStatus(204);
  //   });

  //   app.post("auths/login", (req, res) => {
  //     const user = req.body;
  //     const accessToken = libs.generateAccessToken(user, );
  //     const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
  //       expiresIn: "1d",
  //     });
  //     refreshTokens.push(refreshToken);

  //     res.cookie("jwt", refreshToken, {
  //       httpOnly: true,
  //       sameSite: "None",
  //       secure: true,
  //       maxAge: 24 * 60 * 60 * 1000,
  //     });

  //     res.json({ accessToken: accessToken, refreshToken: refreshToken });
  //   });
};
