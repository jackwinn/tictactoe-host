const libs = require("../libs/httpAuth");
const bcrypt = require("bcrypt");

module.exports = (app, pool) => {
  app.get("/users/me", libs.authenticateToken, async (req, res) => {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      req.user.email,
    ]);

    const { password, ...rest } = user.rows[0];
    return res.json({ ...rest });
  });

  app.post("/users/register", async (req, res) => {
    const { email, password, username } = req.body;
    console.log(req.body);

    if (!email || !password || !username)
      return res.status(400).json({ message: "All fields are required" });

    const findUserQuery = `SELECT * FROM users WHERE email = $1`;

    try {
      const existingUserResult = await pool.query(findUserQuery, [email]);

      if (existingUserResult.rows.length > 0) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = `INSERT INTO users (email, password, username) 
            VALUES ($1, $2, $3)`;

      await pool.query(insertUserQuery, [email, hashedPassword, username]);

      return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/create-users-table", async (req, res) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await pool.query(createTableQuery);
      return res.status(200).json({ message: "Table created successfully" });
    } catch (err) {
      console.error("Error creating table:", err);
      return res.status(500).json({ error: "Failed to create table" });
    }
  });
};
