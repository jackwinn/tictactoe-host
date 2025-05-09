const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieparser = require("cookie-parser");
const { Pool } = require("pg");

const appPort = process.env.APP_PORT;
// const accessControlAllowOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
const accessControlAllowOrigin = "https://jackwinn.github.io";
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

require("./src/services/authService")(app, pool);
require("./src/services/userService")(app, pool);
require("./src/services/websocketService")(app, pool, accessControlAllowOrigin);

app.listen(appPort, (error) => {
  if (error) {
    console.log(
      "An error has occurred, unable to start Tic Tac Toe host",
      error
    );
  } else console.log(`Tic Tac Toe app running at http://localhost:${appPort}`);
});
