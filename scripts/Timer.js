"use strict";
(function () {


function int(a) {
    return Math.floor(a)
}

const Time = {
    MILLISECONDS: 1,
    SECONDS: 1e3,
    MINUTES: 6e4,
    HOURS: 36e5,
    DAYS: 864e5,
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    totalYears: 0,
    remainingYears: 0,
    totalMonths: 0,
    remainingMonths: 0,
    totalDays: 0,
    remainingDays: 0,
    totalHours: 0,
    remainingHours: 0,
    totalMinutes: 0,
    remainingMinutes: 0,
    totalSeconds: 0,
    remainingSeconds: 0,
    totalMilliseconds: 0,
    remainingMilliseconds: 0,
    calcTime: function (startDate, endDate) {
        const c = endDate.getTime() - startDate.getTime();
        Time.totalMilliseconds = c / Time.MILLISECONDS;
        Time.totalSeconds = c / Time.SECONDS;
        Time.totalMinutes = c / Time.MINUTES;
        Time.totalHours = c / Time.HOURS;
        Time.remainingHours = int(Time.totalHours);
        Time.remainingMinutes = int(Time.totalMinutes - 60 * int(Time.totalHours));
        Time.remainingSeconds = int(Time.totalSeconds - 60 * int(Time.totalMinutes));
        Time.remainingMilliseconds = int(Time.totalMilliseconds - 1e3 * int(Time.totalSeconds));
    }
};


const START = "start",
RESTART = "restart",
START_PAUSE = "start_pause",
PAUSE = "pause",
STOP = "stop",
NONE = "";


function Start(event) {
    if (Egg.started) {
        return;
    }
    Egg.started = true;
    Egg.start();
    Egg.startButton.classList.add('hidden');
    // document.body.removeEventListener('click', Start, false);
}

const Egg = {
    name: "EggTimer",
    defaultText: "",
    expiredMessage: "",
    title: "",
    label: "",
    progress: 0,
    startTime: 0,
    endTime: 0,
    totalTime: 0,
    parseError: "",
    progressBar: null,
    progressText: null,
    staticArea: null,
    beep: null,
    currDate: null,
    endDate: null,
    ticker: null,
    startButton: null,
    volume: 1,
    started: false,
    blink: false,
    sequence: [],
    canAlert: true,
    start: function () {
        Egg.initializeTimer2("Expired!");
    },
    initializeTimer2: function (label) {
        Egg.endDate = new Date((new Date).getTime() + Egg.totalTime);
        Egg.currDate = new Date;
        Egg.expiredMessage = label || Egg.expiredMessage;
        Egg.progressBar.classList.add('active');
        Egg.update();
        if (!Egg.ticker) {
            Egg.ticker = setInterval(Egg.update, 1e3 / 2)
        }
    },
    update: function () {
        Time.calcTime(new Date(), Egg.endDate);
        Egg.updateParts(Time)
    },
    updateParts: function (Time) {
        if (Time.totalSeconds < 0) {
            Egg.onTimeComplete();
            return
        }
        const clockTime = [];
        if (Time.remainingHours > 0) {
            clockTime.push(padTimeText(Time.remainingHours) + "h");
        }
        if (Time.remainingMinutes >= 0) {
            clockTime.push(Time.remainingMinutes);
        }
        if (Time.remainingSeconds > 0) {
            clockTime.push(padTimeText(Time.remainingSeconds));
        } else {
            clockTime.push(padTimeText(0))
        }
        let separator = Egg.blink ? "." : ":" ;
        Egg.blink = !Egg.blink;
        let title = clockTime.join(separator) + (Egg.label && Egg.label !== "" ? " : " + Egg.label : "");
        Egg.updateTitle(title);
        Egg.updateText(title);
        Egg.progress = (Egg.totalTime - Time.totalMilliseconds) / Egg.totalTime;
        Egg.updateProgressBar();
        // Egg.currDate = new Date
    },
    updateTitle: function (title) {
        document.title = title;
    },
    updateProgressBar: function () {
    },
    updateText: function (text) {
        if (text) Egg.progressText.innerText = text;
    },
    onTimeComplete: function () {
        let beepFinishedPromise = null;
        Egg.progress = 1;
        Egg.updateProgressBar();
        if (Egg.beep && Egg.beep.play) {
            Egg.beep.volume = Egg.volume;
            beepFinishedPromise = Egg.beep.play()
        }
        clearInterval(Egg.ticker);
        Egg.ticker = null;
        Egg.updateTitle(Egg.expiredMessage);
        Egg.progressText.innerHTML = "&#x1F570;";
        Egg.started = false;
        if (beepFinishedPromise && typeof beepFinishedPromise.then === "function") {
            beepFinishedPromise.then(function () {
                console.log("finished");
            });
        }
    }
};

function onKeyPress(e) {
    // e.preventDefault();
    const keyKodeToDirection = function (keyCode) {
        switch (keyCode) {
            case 13: // enter
                return START;
            case 82: // 'r'
                return RESTART;
            case 75: // 'k'
                return PAUSE;
            case 32: // ' '
                return START_PAUSE;
            default:
                return keyCode;
        }
    };
    const code = keyKodeToDirection(e.keyCode);
    console.log(code);
    if (code === START) {
        Start();
    } else if (code === RESTART) {
        Egg.started = false;
        Start();
    } else if (code === START_PAUSE) {
        if (!Egg.started) {
            Start();
        } else {
            Egg.pause();
        }
    }
}


    function padTimeText(value) {
    return value < 10 ? "0" + value : "" + value
}

function init() {
    const hash = window.location.href.split('#')[1] || 4;
    Egg.totalTime = hash * 60000;
    Egg.progressBar = document.querySelector("#progress");
    Egg.progressText = document.querySelector("#progressText");
    Egg.startButton = document.querySelector("#tapButton");
    Egg.beep = document.getElementById("beepbeep");
    Egg.progressBar.style.transitionDuration = (Egg.totalTime / 1000) + "s";
    document.body.addEventListener('click', Start, false);
    window.addEventListener('keydown', onKeyPress);
    Egg.endDate = new Date((new Date).getTime() + Egg.totalTime);
    Egg.update();

    if (Egg.beep && Egg.beep.load) {
        Egg.beep.load();
    }
}

if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener("DOMContentLoaded", function (event) {
        init();
    });
}
})();
