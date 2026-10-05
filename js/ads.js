// ==========================================
// JOBTIDE ADS
// ==========================================

function loadAds() {

    document
        .querySelectorAll("[data-ad-slot]")
        .forEach(slot => {

            const type =
                slot.dataset.adSlot;

            console.log(
                `Ad slot ready: ${type}`
            );

            /*
             * Your Adsterra code will be placed
             * inside the corresponding HTML slot.
             */
        });
}


document.addEventListener(
    "DOMContentLoaded",
    loadAds
);