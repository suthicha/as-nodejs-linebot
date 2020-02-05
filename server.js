const http = require("http");
const config = require("config");
const app = require("./src/app");

/** define listener port */
const port = process.env.PORT || config.PORT;

/** create server to listen */
const server = http.createServer(app);
server.listen(port);

console.log("http://localhost:" + port);
