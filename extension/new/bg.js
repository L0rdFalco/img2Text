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

    }

})

async function cookieChecker(cb) {
    let res = await chrome.cookies.getAll({ url: "https://imagetotext.onrender.com/" })

    if (res.length == 0) {

        cb({
            status: false,
            message: "website not logged in"
        })

    }

    else {
        cb({
            status: true,
            message: "website logged in"
        })
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "from-popup-checkauth") {

        cookieChecker(sendResponse)

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

    });


//another way of open a url in a new tab
function openTab() {
    chrome.tabs.create({
        url: "popup/popup.html"
    })
}
