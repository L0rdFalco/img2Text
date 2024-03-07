const activateBtn = document.getElementById("activateBtn");

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".close-modal")

function toggleModalAndOverlay() {
    modal.classList.toggle("hidden")
    overlay.classList.toggle("hidden")

}

closeModalBtn.addEventListener("click", toggleModalAndOverlay)
overlay.addEventListener("click", toggleModalAndOverlay)

activateBtn.addEventListener("click", async function (e) {
    const res = await chrome.runtime.sendMessage({
        message: "from-options-activate"
    })

    if (res) {

        /**
     * if response shows that the user has bought a subscription or is a premium member
     * change the dom to reflect this situation
     */
    }


})