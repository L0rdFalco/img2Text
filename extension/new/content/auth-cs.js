/**
1 inject this into the authpage of the backend
2 extract the auth token and
3 send it to bg.js for further processing
*/

function getToken() {
    let token = null;
    let storagePollInterval = setInterval(async function () {
        token = localStorage.getItem("jwt_token")
        //send it to the bg.js
        if (token) {

            chrome.runtime.sendMessage({
                message: "from-auth-cs.js",
                token: token
            })
            clearInterval(storagePollInterval)
        }


    }, 4000)

}

getToken()