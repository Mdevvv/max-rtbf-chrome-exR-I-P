document.addEventListener("DOMContentLoaded", () => {
    const name = document.getElementById("name");
    let MPD,lit, scheme = "none";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            const currentUrl = activeTab.url;
        
            chrome.runtime.sendMessage({ action: "getMatchedMPD", url: currentUrl }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Erreur :", chrome.runtime.lastError);
                    return;
                }

                // Afficher le résultat dans la popup
                const mpd = document.getElementById("mpd");
                const license = document.getElementById("license");
                const schemeSelect = document.getElementById("schemeSelect");
                

                if(response.license) {
                    license.innerHTML = `${response.license}`;
                    lit = response.license;
                } else {
                    license.innerHTML = "Aucune correspondance trouvée.";
                }
                if(response.type) {
                    schemeSelect.value = response.type;
                    scheme = response.type;
                }

                if (response.origin) {
                    mpd.innerHTML = `${response.origin}`;
                    MPD = response.origin;

                } else {
                    mpd.innerHTML = "Aucune correspondance trouvée.";
                }
            });
        }
    });

    name.addEventListener("input", () => {

        const commandRes = document.getElementById("commandRes");

        commandRes.value = `${scheme}|||${MPD}|||${lit}|||${name.value}`;
    });
});