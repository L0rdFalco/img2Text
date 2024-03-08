const mainCont = document.getElementById("main")
const btnDivCont = document.getElementById("btnDiv");

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

    console.log("res===>", res);

    if (res.status) {
        //logged in so render the generate button

        btnDivCont.innerHTML = `
            <p>take a whole page screenhot</p>
            <button id="wp_screenshot">capture page</button>            
            
            <br>

            <p>take a custom screenhot</p>
            <button id="cus_screenshot">capture part</button>
            `
        mainCont.remove()
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
    const wp_screenshottarget = e.target.closest("#wp_screenshot"); // Or any other selector.
    const cus_screenshottarget = e.target.closest("#cus_screenshot"); // Or any other selector.
    const logintarget = e.target.closest("#login"); // Or any other selector.





    if (wp_screenshottarget) {
        // take screenshot and open in new tab

    }
    else if (cus_screenshottarget) {
        /**
 * check if is premium user if not, show modal
 * if free user, if no_thanks is clicked then show button
 */

        chrome.runtime.sendMessage({ message: "from-popup-account-status" }, (res) => {
            if (res.state) {
                //paying user
                //take selected ss and open in new tab

            }
            else {
                //free user
                toggleModalAndOverlay({
                    heading: "feature restricted!",
                    message: "Please pay to unlock. I also got bills ;)",
                    btnText: "pay a one time $5!",
                    link: "#"


                })
            }
        })



    }

    else if (logintarget) {
        // openTab("https://imagetotext-lper.onrender.com/login")
        openTab("http://127.0.0.1:3000/login")
    }


})
