const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieparser = require("cookie-parser");

const port = process.env.PORT;
const accessControlAllowOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
const app = express();

app.use(cors());
app.use(cookieparser());
app.use(express.json());
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", accessControlAllowOrigin);

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

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

require("./src/services/authService")(app);
require("./src/services/userService")(app);

app.listen(port, (error) => {
  if (!error) {
    console.log(`Tic Tac Toe host is running and listening on port ${port}`);
  } else
    console.log(
      "An error has occurred, unable to start Tic Tac Toe host",
      error
    );
});
