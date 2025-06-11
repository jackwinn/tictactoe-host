1. Setup and installation instructions:
- clone the Github repository to your desired folder
- open the project in your preferred code editor
- ensure your node version is 20.18.0 or above
- ensure you are using npm package manager
- in the terminal, run the command: npm i to install dependencies
- in the terminal, run the command: npm run start:local to start the server


2. Technologies used:
- node.js. Runtime environment for executing JavaScript on the server
- express.js. Backend framework for handling HTTP requests
- socket.IO – Real-time communication between client and server
- JWT(JSON Web Tokens). Authentication and authorization
- bcrypt. For securely hashing passwords
- cors. Enables Cross-Origin Resource Sharing for handling requests from different origins
- cookie-parser. Parses cookies attached to client requests
- cross-env. Allows setting environment variables across platforms
- pg. PostgreSQL client for Node.js, used to interact with a PostgreSQL database.


3. Deployment instructions on Render:
- create an account on Render: https://render.com/
- go to "New" > "Web Service"
- select Git Provider > login to your Github account 
- select Github repository > key in Web Service name > select a region
- edit the start command to: cross-env NODE_ENV=prod node index.js
- select "instance type": Free
- finally click "Deploy Web Service"

4. Live link to deployed application:
- https://tictactoe-host.onrender.com

5. Extras:
- Rechallenge option
- Scoreboard

6. Demo Instructions:  
- create 2 accounts with different emails
- login 1 account in regular mode and another 1 in incognito mode (your preferred browser)
- click "Play Online" on both window to start the match
