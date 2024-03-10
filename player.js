let playerApiLoaded = false
const callbacks = []
window.onYouTubeIframeAPIReady = () => {
    playerApiLoaded = true
    callbacks.forEach(c => c(window.YT))
    callbacks.length = 0 // free memory
}

function loadYouTubePlayerAPI() {
    if (playerApiLoaded) return Promise.resolve(window.YT)

    return new Promise(resolve => {
        if (document.querySelector("script[src='https://www.youtube.com/iframe_api']") === null) {
            const ytScriptTag = document.createElement('script');
            ytScriptTag.src = "https://www.youtube.com/iframe_api";
            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(ytScriptTag, firstScriptTag);
        }
        callbacks.push(resolve)
    })
}


export async function YouTubePlayer(elementId) {
    const yt = await loadYouTubePlayerAPI()
    return new Promise(resolve => {
        const player = new yt.Player(elementId, {
            height: 450,
            width: 800,
            videoId: null,
            playerVars: {
                controls: 0,
                disablekb: 1,
            },
            events: {
                onReady() {
                    resolve(player)
                },
            }
        })
    })
}