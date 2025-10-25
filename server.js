#!/usr/bin/env node
process.__dirname = __dirname

const express = require("express")
const http = require("http")
const path = require("path")
const socketIo = require("socket.io")
const expressFileupload = require("express-fileupload")
const expressDevice = require("express-device")
const cookieParser = require("cookie-parser")
const { serverInit, getConfig, cout } = require("./utils/server-helpers")
const { startTunnel } = require("./utils/tunnel")

serverInit()
const app = express()
const server = http.createServer(app)
const io = new socketIo.Server(server, { cors: { origin: "*" } })
global.IO = io

const PORT = parseInt(process.env.PORT || getConfig("port") || "3000", 10)
const HOST = process.env.HOST || "0.0.0.0"

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }))
app.set("views", path.join(__dirname, "views"))
app.use(expressDevice.capture())
app.set("view engine", "ejs")
app.use(expressFileupload())
app.use(cookieParser())
app.use(express.json())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  next()
})

app.use("/ws-app", require("./router/ws-app"))
app.use("/", require("./router"))
app.use("/panel", require("./router/panel"))

server.listen(PORT, async () => {
  const url = await startTunnel().catch(() => "no-tunnel")
  cout.out(`LOCAL SERVER  : http://${HOST}:${PORT}`)
  cout.out(`TUNNEL SERVER : ${url}`)
})

io.on("connection", socket => {
  cout.out("socket connected: " + socket.id)
  socket.on("disconnect", () => cout.out("socket disconnected: " + socket.id))
})
