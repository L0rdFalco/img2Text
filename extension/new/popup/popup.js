const mainCont = document.getElementById("main")
const parentCont = document.getElementById("parent")
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
    const wp_screenshottarget = e.target.closest("#wp_screenshot"); // whole page ss
    const custom_screenshottarget = e.target.closest("#cus_screenshot");// custom ss
    const notarget = e.target.closest("#no");
    const logintarget = e.target.closest("#login");


    if (wp_screenshottarget) {
        // take screenshot, open in new tab send it as post request for processing

        chrome.runtime.sendMessage({ message: "from-popup-wp" }, (res) => {
            console.log("wp res:", res);

            if (res.message === "screenshot taken") {
                //rewrite the dom to show appropriate message
                //post request with image url data

                parentCont.innerHTML = `
                <div id="main" class="activationContent">
                <div id="msg">
                    <h3>Processing the screenshot.</h3>
                    <h3>Please be patient...</h3>
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
            else {
                console.log("something went wrong!");
            }
            // let image = new Image();
            // image.src = res.payload;

            // let w = window.open("");
            // w.document.write(image.outerHTML);
        })


    }
    else if (custom_screenshottarget) {
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

    else if (notarget) {
        toggleModalAndOverlay({})
        console.log("take the screenshot and open it in new tab!");
    }

    else if (logintarget) {
        // openTab("https://imagetotext-lper.onrender.com/login")
        openTab("http://127.0.0.1:3000/login")
    }


})
