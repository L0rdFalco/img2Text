const mainCont = document.getElementById("main")
const btnDivCont = document.getElementById("btnDiv");


function openTab(url) {
    chrome.tabs.create({
        url: url
    })
}

(async () => {
    let res = await chrome.runtime.sendMessage({
        message: "from-popup-checkauth"
    })

    if (res.status) {
        //logged in so render the generate button

        btnDivCont.innerHTML = `
            <p>take a whole page screenhot</p>
            <button id="screenshot">take screenshot</button>
            `
    }

    else if (!res.status) {
        //not logged in so render the login button
        mainCont.innerHTML = `
            <p>1. click the login button below</p>
            <p>2. after login into the website</p>
            <p>3. open this extension popup again</p>
            <button id="login">login</button>
            
            `

        btnDivCont.remove()

    }

})()


document.addEventListener("click", function (e) {
    const screenshottarget = e.target.closest("#screenshot"); // Or any other selector.
    const logintarget = e.target.closest("#login"); // Or any other selector.


    if (screenshottarget) {
        openTab("https://imagetotext-lper.onrender.com/")
        // openTab("http://127.0.0.1:3000/")
    }

    else if (logintarget) {
        openTab("https://imagetotext-lper.onrender.com/login")
        // openTab("http://127.0.0.1:3000/login")
    }


})
