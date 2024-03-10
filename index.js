import {YouTubePlayer} from "./player.js"

const shows = []

const player = await YouTubePlayer("player")
const controller = Controller(Model(shows), player)

setInterval(controller.reconcile, 200)
player.addEventListener("stateChange", (event) => {
    controller.reconcile()
})

// player.cueVideoById("s38tEcEXUAo", 300)
// setTimeout(() => player.playVideo(), 100)

const episodes = [
    {
        videos: [
            {
                id: "KAdPNx0ArRc",
                duration: 54,
            },
            {
                id: "0yPuL3XWV2I",
                duration: 186,
            },
            {
                id: "QYtj4F8bG5k",
                duration: 240,
            }
        ]
    },
    // {
    //     videos: [
    //         {
    //             id: "s38tEcEXUAo",
    //             duration: 15 * 60,
    //         }
    //     ]
    // },
    // {
    //     videos: [
    //         {
    //             id: "FDdHTAOCccc",
    //             duration: 56 * 60,
    //         }
    //     ]
    // },
    {
        videos: [
            {
                // SB Email "dragon"
                id: "90X5NJleYJQ",
                duration: 210,
            }
        ]
    },
    {
        videos: [
            {
                // SB Email "techno"
                id: "JwZwkk7q25I",
                duration: 78,
            }
        ]
    },
]

function Model() {
    let scheduleCache = {}
    return {
        getTargets,
    }

    function getTargets(time) {
        const seconds = Math.floor(time / 1000)
        const secondsOfDay = (seconds - 8 * 3600) % (24 * 3600)
        const dayBoundary = seconds - secondsOfDay
        const schedule = getSchedule(String(dayBoundary))
        let totalDuration = 0
        let video
        for (video of schedule) {
            totalDuration += video.duration
            if (totalDuration >= secondsOfDay) {
                return {
                    targetVideoId: video.id,
                    targetTime: video.duration - (totalDuration - secondsOfDay)
                }
            }
        }
        // const targetTime = Math.floor(seconds % 900)
        // const targetVideoId = "s38tEcEXUAo"
        // return {targetTime, targetVideoId}
    }

    function getSchedule(seed) {
        if (!scheduleCache[seed]) {
            // clear the cache; we should only ever need to cache
            // one day's schedule at a time.
            scheduleCache = {}
            scheduleCache[seed] = generateSchedule(seed)
        }
        return scheduleCache[seed]
    }

    function generateSchedule(seed) {
        const rng = mulberry32(cyrb128_32(seed))
        let totalDuration = 0
        let schedule = []
        while (totalDuration < 24 * 3600) {
            const episode = pick(episodes, rng())
            totalDuration += episode.videos.map(v => v.duration).reduce(add, 0)
            schedule.push(...episode.videos)
        }
        return schedule
    }

    function pick(array, fraction) {
        return array[Math.floor(fraction * array.length)]
    }

    function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5
          t = Math.imul(t ^ t >>> 15, t | 1)
          t ^= t + Math.imul(t ^ t >>> 7, t | 61)
          return ((t ^ t >>> 14) >>> 0) / 4294967296
        }
    }

    function cyrb128_32(str) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i)
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
        return (h1^h2^h3^h4)>>>0
    }    
}

function add(a, b) {
    return a + b
}

const UNSTARTED = -1
const ENDED = 0
const PLAYING = 1
const PAUSED = 2
const BUFFERING = 3
const CUED = 5

function Controller(model, player) {
    return {
        reconcile
    }
    function reconcile() {
        const currentState = player.getPlayerState()
        const currentVideoId = videoIdFromUrl(player.getVideoUrl())
        switch (currentState) {
            // if the player is in an "in-between" state, just let it do its thing
            case BUFFERING:
                return;
            case CUED:
            case UNSTARTED:
            case ENDED:
            case PLAYING:
            case PAUSED:
        }

        const now = +new Date()
        const {targetVideoId, targetTime} = model.getTargets(now) //= "s38tEcEXUAo"

        // loop every 15 minutes
        // const targetTime = Math.floor((now % 900000) / 1000)
        if (currentVideoId !== targetVideoId) {
            player.cueVideoById(targetVideoId, targetTime)
            return;
        }
        
        if (currentState !== PLAYING && currentVideoId) {
            player.playVideo()
            return;
        }

        const currentTime = player.getCurrentTime()
        if (delta(currentTime, targetTime) >= 5) {
            player.seekTo(targetTime)
        }
    }
}

function delta(a, b) {
    return Math.abs(a - b)
}

function videoIdFromUrl(url) {
    return /v=(.{11})/.exec(url)?.[1]
}
