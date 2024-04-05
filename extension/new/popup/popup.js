const mainCont = document.getElementById("main")
const parentCont = document.getElementById("parent")
const btnDivCont = document.getElementById("btnDiv");
const errorEl = document.getElementById("error");

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".close-modal")

let choice = false;

function toggleModalAndOverlay(messageObj) {
    modal.classList.toggle("hidden")
    overlay.classList.toggle("hidden")

    document.getElementById("modalHeader").innerText = messageObj.heading
    document.getElementById("modalText").innerText = messageObj.message
    document.getElementById("accountState").innerText = messageObj.btnText
    document.getElementById("accountState").dataset.link = messageObj.link

}

closeModalBtn.addEventListener("click", toggleModalAndOverlay)
overlay.addEventListener("click", toggleModalAndOverlay)


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
            <p>screenshot visible page</p>
            <button id="wp_screenshot">capture page</button>            
            
            <br>

            <p>take a custom screenshot</p>
            <button id="cus_screenshot">capture part</button>
            `
        mainCont.remove()
    }

    else if (!res.status) {
        //not logged in so render the login button
        mainCont.innerHTML = `
            <p>to start extracting text from images:</p>
            <p>1. click the login button below</p>
            <p>2. after logging into the website,</p>
            <p>3. open this extension popup again</p>
            <p>4. refresh page if necessary</p>
            <button id="login">login</button>
            
            `
        btnDivCont.remove()

    }

})()


function loader(mgsArr) {

    parentCont.innerHTML = `
    <div id="main" class="activationContent">
    <div id="msg">
        <h3>${mgsArr[0]}</h3>
        <h3>${mgsArr[1]}...</h3>
    </div>
    <div class="boxes">
        <div class="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <div class="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <div class="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <div class="box">
            <div></div>
            <div></div>
            <div></div>
            <div> </div>
        </div>
    </div>


</div>
    
    `

}
document.addEventListener("click", function (e) {
    const wp_screenshottarget = e.target.closest("#wp_screenshot"); // whole page ss
    const custom_screenshottarget = e.target.closest("#cus_screenshot");// custom ss
    const notarget = e.target.closest("#no");
    const logintarget = e.target.closest("#login");
    const accStateTarget = e.target.closest("#accountState");


    if (wp_screenshottarget) {

        chrome.runtime.sendMessage({ message: "from-popup-wp" }, (res) => {

            if (res.message === "screenshot taken") {


                loader(["Processing the screenshot.", "Please be patient"])


            }
            else {
                console.log("something went wrong when processing screenshots!");
            }

        })


    }
    else if (custom_screenshottarget) {

        chrome.runtime.sendMessage({ message: "from-popup-account-status" }, (res) => {
            if (res.payload === "CO>(ZPF5tgU?1wJ") {
                loader(["1. Select the area to screenshot", "2. Press Enter or double click Rectangle"])

                chrome.runtime.sendMessage({ message: "from-popup-cus" }, (res) => {
                })

            }
            else {
                //free user
                loader(["", ""])
                toggleModalAndOverlay({
                    heading: "feature restricted!",
                    message: "Please pay to unlock. I also got bills ;)",
                    btnText: "pay a one time $5!",
                    link: "https://imagetotext-lper.onrender.com/pricing"


                })
            }
        })



    }

    else if (notarget) {
        toggleModalAndOverlay({})
        loader(["1. Select the area to screenshot", "2. Press Enter or double click Rectangle"])
        chrome.runtime.sendMessage({ message: "from-popup-cus" }, (res) => {
        })
    }

    else if (logintarget) {
        openTab("https://imagetotext-lper.onrender.com/login")
    }

    else if (accStateTarget) {
        openTab("https://imagetotext-lper.onrender.com/pricing")

    }


})


chrome.runtime.onMessage.addListener((request) => {

    if (request.source === "xget") {
        errorMessage(request.message)
    }
})


function errorMessage(message) {
    errorEl.innerText = message
    errorEl.style.display = "block"

    setTimeout(() => {
        errorEl.style.display = "none"

    }, 3000)
}
