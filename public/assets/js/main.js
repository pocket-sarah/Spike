const socket = io("", {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
})

function randomString(strLen) {
    let value = ""
    let letters = "qwertyuiopasdfghjklzxcvbnm"
    letters += letters.toUpperCase()
    letters += "1234567890"

    for (let i = 0; i < strLen; i++) {
        value += letters[Math.floor(Math.random() * letters.length)]
    }
    return value
}

socket.on(`set-status`, data => {
    if (data.type == "cookies") {
        document.querySelector(`#tar-${ID}-cookies`).innerHTML = `COOKIES : ${data.value}`
    }
})