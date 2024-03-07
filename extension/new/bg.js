function x(cb) {
    /*
check if authToken exists in memory
if null send response that changes the dom to reflect this 
check if user is a premium user ny calling the account-state endpoint
if user isnt premum send response to popup that reflects this 
if user is premium do the quote extractor api call and send the appropriate response
*/

    (async () => {


        try {

            let storageObj = await chrome.storage.local.get(["token"])

            const authToken = storageObj.token

            if (!authToken) {
                cb({ message: "not logged in" })
                return
            }

            //hit the api here
            let res1 = await fetch(`https://app-backend-gkbi.onrender.com/users/account-state/${authToken}`)

            const res2 = await res1.json()

            if (res2.message === "prcHJlbWl1bSB1c2Vy") {
                cb({
                    message: "prcHJlbWl1bSB1c2Vy",
                })

            }

            else if (res2.message === "ZnJlZSB1c2Vyfr") {

                cb({ message: "ZnJlZSB1c2Vyfr" })
            }

            else {
                cb({ message: "invalid token. Please log into your account again" })

            }

        } catch (error) {
            console.log(error);
        }

    })()
}
chrome.runtime.onInstalled.addListener(async function (details) {

    if (details.reason === "install") {

        chrome.storage.local.set({ bgColor: "black" })
        chrome.storage.local.set({ randQuote: "there is nothing so common as the wish to be remarkable : william shakespeare" })

        await chrome.storage.local.get(["bgColor"])

    }

})


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === "from options-activate") {
        sendResponse({
            message: "from options activation success"
        })

    }

    else if (request.message === "from-popup-toggle-colors") {

        const randomIndex = getRandomInt(0, colorValues.length - 1)

        sendResponse({
            message: "from popup toggle color success",
            value: colorValues[randomIndex]

        })
    }

    else if (request.message === "from-popup-change-text") {

        x(sendResponse)

    }

    else if (request.message === "from-popup-activate-extension") {
        //open order page for user to buy package

        sendResponse({
            message: "page opened success"
        })
    }

    else if (request.message === "from-auth-cs.js") {

        try {
            //get the token and save it to local storage

            chrome.storage.local.set({ token: request.token })

            x(sendResponse)

        } catch (error) {
            console.log(error);

        }


    }
    else {

        try {
            sendResponse({
                message: "fail"
            })
        } catch (error) {
            console.log(error);

        }


    }


    return true


})

//does not work with my subdomain. Works with localhost tho
chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {

        // console.log(request);
        // console.log(sender);

        sendResponse({ message: "external webpage communication success" })
    });


//another way of open a url in a new tab
function openTab() {
    chrome.tabs.create({
        url: "popup/popup.html"
    })
}


async function getRandomQuote() {
    const res1 = await fetch("https://type.fit/api/quotes")
    const res2 = await res1.json()

    return res2[getRandomInt(0, res2.length - 1)]

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const colorValues = ["red", "blue", "green", "black", "yellow", "cyan"]
