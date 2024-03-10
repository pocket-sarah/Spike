process.__dirname = __dirname

const { serverInit, getConfig, cout } = require("./utils/server-helpers")
const expressFileupload = require("express-fileupload")
const { startTunnel } = require("./utils/tunnel")
const expressDevice = require("express-device")
const cookieParser = require("cookie-parser")
const socketIo = require("socket.io")
const electron = require("electron")
const express = require("express")
const http = require("http")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new socketIo.Server(server)
const PORT = process.env.PORT || getConfig('port')

serverInit()
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }))
app.set("views", path.join(__dirname, 'views'))
app.use(expressDevice.capture())
app.set("view engine", "ejs")
app.use(expressFileupload())
app.use(cookieParser())
app.use(express.json())
global.IO = io

// +======== cors config ==========+

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    next()
})

// non admin check
app.use("/ws-app", require("./router/ws-app"))


// admin check
app.use("/", require("./router"))
app.use("/panel", require("./router/panel"))


server.listen(PORT, async () => {
    await startTunnel()
    cout.out(`LOCAL SERVER  : http://localhost:${PORT}`)
    cout.out(`TUNNEL SERVER : ${process.env.WSTUNNELURL}`)
})

electron.app.on("ready", () => {
    cout.out("Electron browser ready.")
})

electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit = false
    }
})