var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic("app")).listen(5000);

console.log("Server listening on: http://localhost:5000");