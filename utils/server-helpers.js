const { configCollection, adminCollection } = require("./DB")
const path = require("path")
const os = require("os")
const fs = require("fs")
const AdmZip = require('adm-zip')

const OBJ = {
    serverInit() {
        const folders = [
            path.join(process.__dirname, "ssd", "cookies")
        ]

        for (const folder of folders) {
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true })
            }
        }

        let extPath = path.join(process.__dirname, 'public')
        if (!fs.existsSync(path.join(extPath, 'web_public'))) {
            fs.mkdirSync(path.join(extPath, 'web_public'))

            try {
                const zipApp = new AdmZip(path.join(extPath, 'web_public.zip'))
                zipApp.extractAllTo(extPath, true)

            } catch (error) {
                this.cout.err(`ERROR on extracting web file in ${path.join(extPath, 'web_public.zip')} do it manually`, error)
            }
        }

        OBJ.cout.out("server init success.")
    },
    cout: {
        time() {
            const date = new Date()
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        },
        out(...data) {
            console.log(`[${this.time()}]-(OUT):: ${data}`)
        },
        err(...data) {
            console.log(`[${this.time()}]-(ERR):: ${data}`)
        }
    },
    getConfig(key = undefined) {
        const data = configCollection.find({})
        if (key) return data[key]
        return data
    },
    checkAdminToken: function (req, res, next) {
        const adminConfig = adminCollection.find({})
        const token = req.cookies.token

        if (token != undefined && token == adminConfig.token) {
            next()
        } else {
            res.clearCookie("token")
            res.redirect("/")
        }
    },
    randomString(strLen) {
        let value = ""
        let letters = "qwertyuiopasdfghjklzxcvbnm"
        letters += letters.toUpperCase()
        letters += "1234567890"

        for (let i = 0; i < strLen; i++) {
            value += letters[Math.floor(Math.random() * letters.length)]
        }
        return value
    },
    appInformation: {
        software: {
            version: "2.0.0",
            type: "Web Based"
        },
        system: {
            cpu: os.cpus()[0].model,
            core: os.cpus().length,
            machine: os.machine(),
            ram: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            platform: os.platform()
        },
        os: {
            user: os.userInfo().username,
            type: os.type(),
            arch: os.arch(),
            release: os.release(),
        },
        applications: {
            node: process.version
        }
    },
    browserAgrs: [
        '--allow-pre-commit-input',
        '--disable-background-networking',
        '--enable-features=NetworkServiceInProcess2',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-features=Translate,BackForwardCache,AcceptCHFrame,AvoidUnnecessaryBeforeUnloadCheckSync',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-first-run',
        '--password-store=basic',
        '--use-mock-keychain',
        '--export-tagged-pdf',
        '--disable-infobars',
        '--lang=en-US',
        '--no-sandbox'
    ]
}

OBJ.browserAgrs.push(`--remote-debugging-port=${OBJ.getConfig('debug-port')}`)

module.exports = OBJ