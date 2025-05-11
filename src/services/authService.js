const jwt = require("jsonwebtoken");
const libs = require("../libs/httpAuth");
const bcrypt = require("bcrypt");

module.exports = (app, pool) => {
  app.post("/auths/login", async (req, res) => {
    const { email, password } = req.body;

    const findUserQuery = `SELECT * FROM users WHERE email = $1`;

    const existingUser = await pool.query(findUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      const userFound = existingUser.rows[0];

      const isPasswordMatch = await bcrypt.compare(
        password,
        userFound.password
      );
      // console.log(isPasswordMatch)
      if (isPasswordMatch) {
        const accessToken = jwt.sign(
          {
            email: userFound.email,
            username: userFound.username,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
          }
        );

        const refreshToken = jwt.sign(
          {
            email: userFound.email,
            username: userFound.username,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
        );

        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        const result = {
          accessToken: accessToken,
        };
        return res.status(200).json(result);
      } else {
        return res.status(401).json({ message: "Password is not match." });
      }
    } else {
      return res.status(400).end();
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
            return res.status(401).end();
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
      return res.status(401).end();
    }
  });
};
