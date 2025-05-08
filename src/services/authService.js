const jwt = require("jsonwebtoken");
const libs = require("../libs/httpAuth");

module.exports = (app, pool) => {
  app.post("/auths/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    const findUserQuery = `SELECT * FROM users WHERE email = $1`;

    const existingUserResult = await pool.query(findUserQuery, [email]);
    if (existingUserResult) {
      const accessToken = jwt.sign(
        {
          email: email,
          password: password,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );

      const refreshToken = jwt.sign(
        {
          email: email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({ accessToken });
    } else {
      return res.status(406).json({
        message: "Invalid credentials",
      });
    }
  });

  app.post("/auths/refreshToken", (req, res) => {
    if (req.cookies?.jwt) {
      console.log(`req.cookies?.jwt: ${req.cookies?.jwt}`);
      const refreshToken = req.cookies.jwt;

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) {
            return res.status(406).json({ message: "Unauthorized" });
          } else {
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
};
