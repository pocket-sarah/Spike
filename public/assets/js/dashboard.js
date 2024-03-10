let creatorBtn = document.querySelector("#creator-btn")
let creatorContainer = document.querySelector(".creator-container")
let creatorContainerForm = document.querySelector(".creator-container form")
let previewUrl = document.querySelector("#preview-url")
let settingBtn = document.querySelector("#setting-btn")
let settingsContainer = document.querySelector(".settings-container")
let credentialsConfig = document.querySelector("#credentials-config")
let uploadCookie = document.querySelector("#upload-cookie")
let deleteAllTargets = document.querySelector("#delete-all-targets")
let informationBtn = document.querySelector("#information-btn")
let informationContainer = document.querySelector(".information-container")
let closeAllTabs = document.querySelector("#close-all-tabs")
let appSelect = creatorContainerForm.querySelector(`[name="appName"]`)
let appDescription = document.querySelector(".app-description")


document.querySelectorAll(".dialog .head .fa-xmark").forEach(btn => {
    btn.parentElement.addEventListener("click", () => {
        btn.parentElement.parentElement.parentElement.parentElement.classList.remove("active")
    })
})

document.querySelectorAll(".targets-content #panel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id")
        location.href = `/panel?id=${id}`
    })
})

document.querySelectorAll(".targets-content #delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id")
        if (confirm(`Do you want to delete ${id}?`)) {
            try {
                const response = await axios.get(`/delete-target?id=${id}`)

                if (response.data == "OK") {
                    location.reload()
                } else {
                    alert(response.data)
                }
            } catch (error) {
                alert(error.message)
            }
        }
    })
})

creatorBtn.addEventListener("click", () => {
    creatorContainer.classList.add("active")
})

creatorContainerForm.addEventListener("submit", async e => {
    e.preventDefault()
    let data = {}

    for (const inp of e.target) {
        if (inp.name == undefined || inp.name.length == 0) continue
        data[inp.name] = inp.value
    }

    if (data.server == "self") {
        data.server = location.origin
    } else if (data.server == "tunnel") {
        try {
            const response = await axios.get("/tunnel")
            if (response.data.length == 0) {
                alert("tunnel error so you can use self")
                return
            } else {
                data.server = response.data
            }
        } catch (error) {
            console.log(error);
            alert("tunnel error so you can use self")
            return
        }
    }

    let url = `${data.server}/ws-app/${data.appName}/`
    if (data.mask.length > 0) {
        const urlObj = new URL(url)
        url = `${urlObj.protocol}//${data.mask}@${urlObj.host}${urlObj.pathname}`
    }

    if (data.email.length > 0) { url = `${url}?email=${data.email}` }

    if (data.iframe == "yes") {
        try {
            const response = await axios.post(`/ws-app/${data.appName}`, data, {
                headers: {
                    "content-type": "application/json"
                }
            })

            if (response.data.includes("/panel")) {
                location.href = response.data
            } else {
                alert(response.data)
            }
        } catch (error) {
            console.log(error);
            alert(error.message)
        }
    }

    await navigator.clipboard.writeText(url)
    previewUrl.value = url
})

// settings 
settingBtn.addEventListener("click", () => {
    settingsContainer.classList.add("active")
})

credentialsConfig.addEventListener("submit", async e => {
    e.preventDefault()
    const data = {}

    for (const key of e.target) {
        if (key.getAttribute("name") == undefined) continue
        data[key.name] = key.value
    }

    try {
        const response = await axios.post("/credentials-config", data, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (response.data == "OK") {
            location.href = "/"
        } else {
            alert(response.data)
        }
    } catch (error) {
        alert(error.message)
    }
})

uploadCookie.addEventListener("click", () => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".wszip"
    fileInput.addEventListener("change", async e => {
        try {
            const response = await axios.post("/openbrowser-with-cookie", {
                file: e.target.files[0]
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            alert(response.data)
        } catch (error) {
            alert(error.message)
        }
    })

    fileInput.click()
})

deleteAllTargets.addEventListener("click", async () => {
    if (confirm("Do you want to delete all targets?")) {
        try {
            const response = await axios.get(`/delete-target?id=all`)

            if (response.data == "OK") {
                location.reload()
            } else {
                alert(response.data)
            }
        } catch (error) {
            alert(error.message)
        }
    }
})


informationBtn.addEventListener("click", () => {
    informationContainer.classList.add("active")
})

closeAllTabs.addEventListener('click', async () => {
    if (confirm("Do you want to close all headless tabs?")) {
        let response = await axios.get("/close-headless-tabs")
        alert(response.data)
    }
})

appSelect.addEventListener("input", async () => {
    const appName = appSelect.value
    const response = await axios.get(`/get-description?appName=${appName}`)
    appDescription.innerHTML = `[${appName}]-(<b>${response.data}</b>)`
})