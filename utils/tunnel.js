const { bin: cloudflaredBinary } = require("cloudflared")
const { cout, getConfig } = require("./server-helpers")
const { spawn } = require("child_process")

let cloudflaredInstance = null

async function startTunnel() {
    try {
        if (cloudflaredInstance != null && cloudflaredInstance.killed == false) {
            cout.out("KILL CLOUDFLARED TUNNEL")
            cloudflaredInstance.kill()
        }

        cout.out("STARTING CLOUDFLARED TUNNEL")
        cloudflaredInstance = spawn(cloudflaredBinary, ["--url", `http://localhost:${getConfig('port')}`])

        let waitingForUrl = new Promise((resolve, reject) => {
            cloudflaredInstance.stderr.on("data", data => {
                let logOutput = data.toString()
                const urlRegex = /https:\/\/[^\s]+/
                const match = logOutput.match(urlRegex)

                if (match) {
                    const extractedUrl = match[0];
                    if (extractedUrl.includes(".trycloudflare.com") && extractedUrl.includes("https://")) {
                        resolve(extractedUrl)
                    }
                }
            })
        })

        process.env.WSTUNNELURL = await waitingForUrl
    } catch (err) {
        cout.err(err.message)
    }
}

module.exports = { startTunnel }