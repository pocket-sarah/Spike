const { OctaviaDB } = require("octavia-db")
const path = require("path")

const DB = new OctaviaDB({
    databaseName: path.join(process.__dirname, "ssd"),
    databasePassword: "white-spikes",
    logging: true
})

const targetDB = new OctaviaDB({
    databaseName: path.join(process.__dirname, "ssd", "targets"),
    databasePassword: "white-spikes",
    logging: true
})

const adminCollection = DB.collection("admin.json")
const configCollection = DB.collection("config.json", false)

module.exports = {
    DB,
    targetDB,
    configCollection,
    adminCollection
}