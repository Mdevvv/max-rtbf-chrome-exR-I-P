const mpdOrigns = ["media.max.com", "rtbf/auvio", "mediawan-vod", "akamaized.net/abxplore"];
const origins = ["play.max.com/video","auvio.rtbf.be/media", "live-replay.abxplore.be/program", "live-replay.abxplore.be"];

const licenseOrigins = ["discomax.com/drm-proxy/any/drm-proxy/drm/license/widevine?keygen=", "licenseServer/widevine/v1/rbm-rtbf"];

let lastMPDMMax, lastMPDRTBF, lastMPDAbexplore, lastMPDMediawan, lastMAXLicense, lastRTBFLicense = null;

function checkMpdOrigin(url) {
    if (!url) return null;
    
    const match = mpdOrigns.find(mpdOrigin => url.includes(mpdOrigin));
    return match || null;
}

function checkOrigin(url) {
    if (!url) return null;
    
    const match = origins.find(origin => url.includes(origin));
    return match || null;
}

function checkLicenseOrigin(url) {
    if (!url) return null;
    
    const match = licenseOrigins.find(licenseOrigin => url.includes(licenseOrigin));
    return match || null;
}

// get mpd
chrome.webRequest.onBeforeRequest.addListener((details) => {
    const match = checkMpdOrigin(details.url);
    
    if (details.method == "GET" && match && details.url.includes(".mpd")) {
        
        switch (match) {
            case "media.max.com":
                lastMPDMMax = details.url;
                break;
            case "rtbf/auvio":
                lastMPDRTBF = details.url;
                break;
            case "mediawan-vod":
                lastMPDMediawan = details.url;
                break;
            case "akamaized.net/abxplore":
                lastMPDAbexplore = details.url;
                break;
        }
    }
    const matchLicense = checkLicenseOrigin(details.url);

    if(details.method == "POST" && matchLicense) {
        console.log(details.url);
        switch (matchLicense) {
            case "discomax.com/drm-proxy/any/drm-proxy/drm/license/widevine?keygen=":
                lastMAXLicense = details.url;
                break;
            case "licenseServer/widevine/v1/rbm-rtbf":
                lastRTBFLicense = details.url;
                break;
        }
    }
}, {urls: ["<all_urls>"],  types: ["xmlhttprequest"]});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getMatchedMPD") {

        //check origin website where pop is opened
        const origin = checkOrigin(message.url);

        switch (origin) {
            case "play.max.com/video":
                sendResponse({origin : lastMPDMMax, license : lastMAXLicense, type : "max-vod"});
                break;
            case "auvio.rtbf.be/media":
                sendResponse({origin : lastMPDRTBF, license : lastRTBFLicense, type : "rtbf"});
                break;
            case "live-replay.abxplore.be/program":
                sendResponse({origin : lastMPDMediawan, license : "no license needed", type : "abxplore-vod"});
                break;
            case "live-replay.abxplore.be":
                sendResponse({origin : lastMPDAbexplore, license : "no license needed", type : "abxplore-live"});
                break;
        }

    }
});