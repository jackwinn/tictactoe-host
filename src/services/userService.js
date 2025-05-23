const libs = require("../libs/httpAuth");
const bcrypt = require("bcrypt");

module.exports = (app, pool) => {
  app.get("/users/me", libs.authenticateToken, async (req, res) => {
    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        req.user.email,
      ]);

      if (!user) return res.status(404).json({ message: "User not found." });
      const { password, ...rest } = user.rows[0];
      return res.status(200).json({ ...rest });
    } catch (err) {
      return res.status(500).end();
    }
  });

  app.post("/users/register", async (req, res) => {
    const { email, password, username } = req.body;
  
    if (!email || !password || !username) return res.status(412).end();
    // console.log(email, password, username);
    const findUserQuery = `SELECT * FROM users WHERE email = $1`;

    try {
      const existingUserResult = await pool.query(findUserQuery, [email]);

      if (existingUserResult.rows.length > 0) {
        return res.status(409).json({ message: "User already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = `INSERT INTO users (email, password, username) 
            VALUES ($1, $2, $3)`;

      await pool.query(insertUserQuery, [email, hashedPassword, username]);
      return res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
      // console.error(err);
      return res.status(500).json({ message: "Internal server error." });
    }
  });

  app.post("/users/updateScore", async (req, res) => {
    try {
      const { gameResult, userId } = req.body;
      const allowedResults = ["win", "lose", "draw"];

      if (!allowedResults.includes(gameResult)) {
        return res.status(400).json({ message: "Invalid result type." });
      }

      const resultMap = {
        win: "win_score",
        lose: "lose_score",
        draw: "draw_score",
      };

      const column = resultMap[gameResult];
      // console.log(column)
      await pool.query(
        `UPDATE users SET ${column} = ${column} + 1 WHERE id= $1`,
        [userId]
      );

      const user = await pool.query("SELECT * FROM users WHERE id = $1", [
        userId,
      ]);
      // console.log(user);

      if (user.rows.length === 0)
        return res.status(404).json({ message: "User not found." });

      const { password, ...rest } = user.rows[0];
      return res.status(200).json({ ...rest });
    } catch (err) {
      // console.error(err);
      return res.status(500).json({ message: "Server error." });
    }
  });

  app.get("/users/list", async (req, res) => {
    const query = `
    SELECT username, win_score, lose_score, draw_score
    FROM users
    ORDER BY win_score DESC
    LIMIT 10;
  `;

    try {
      const result = await pool.query(query);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Internal server error." });
    }
  });

  // app.post("/users/create-table", async (req, res) => {
  //   const createTableQuery = `
  //     CREATE TABLE IF NOT EXISTS users (
  //       id SERIAL PRIMARY KEY,
  //       email VARCHAR(100) UNIQUE NOT NULL,
  //       password VARCHAR(100) NOT NULL,
  //       username VARCHAR(100) NOT NULL,
  //       win_score INT DEFAULT 0,
  //       lose_score INT DEFAULT 0,
  //       draw_score INT DEFAULT 0,
  //       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //     );
  //   `;

  //   try {
  //     await pool.query(createTableQuery);
  //     return res.status(200).json({ message: "Table created successfully" });
  //   } catch (err) {
  //     console.error("Error creating table:", err);
  //     return res.status(500).end();
  //   }
  // });
};
