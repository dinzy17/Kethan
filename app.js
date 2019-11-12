var app = require('./index')
var debug = require('debug')('Blue-Shark:server')
const fs = require('fs')
const http = require('http')
const https = require('https')
var port = normalizePort(process.env.PORT || '3000')
var cron = require('node-cron')
const cronRoute = require("./routes/cronRoute")
// const sslServer = https.createServer(httpsOptions, app).listen(443, () => {
//   console.log('https server running at ' + 443)
// })
 const server = http.createServer(app).listen(port, () => {
   console.log('http server running at ' + port)
 })

//  const server = http.createServer(function (req, res) {
//   res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//   res.end();
// }).listen(80);

// server.listen(port)
// server.listen(443)
// server.on('error', onError)
// server.on('listening', onListening)


function normalizePort(val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

//cron job at every 30 mins daily
cron.schedule('0 1 * * *', () => {
  cronRoute.checkExitStatus()
  cronRoute.checkExpectedStatus()
  cronRoute.checkRecurringExpectedStatus()
})

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {

  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
  console.log("server started on port" + addr.port)
}
