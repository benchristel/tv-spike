shows.register({
    title: "Simon Roper",
    schedule: {
        type: "timeslot",
        hour: 16,
    },
    weight: 1,
    episodes: `
    1230951989 15:17

    for (let v of document.querySelectorAll("ytd-grid-video-renderer")) {
        console.log(v.querySelector("#thumbnail")?.href)
        console.log(v.querySelector("span#text.ytd-thumbnail-overlay-time-status-renderer")?.innerText.trim())
        console.log(v.querySelector("#video-title")?.innerText)
    }
    `
})