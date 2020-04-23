"use strict";
(function () {


function calcTime(startDate, endDate) {
    const MILLISECONDS = 1;
    const SECONDS = 1e3;
    const MINUTES = 6e4;
    const HOURS = 36e5;

    function int(a) {
        return Math.floor(a)
    }

    const c = endDate.getTime() - startDate.getTime();
    const res = {};
    res.totalMilliseconds = c / MILLISECONDS;
    res.totalSeconds = c / SECONDS;
    res.totalMinutes = c / MINUTES;
    res.totalHours = c / HOURS;
    res.remainingHours = int(res.totalHours);
    res.remainingMinutes = int(res.totalMinutes - 60 * int(res.totalHours));
    res.remainingSeconds = int(res.totalSeconds - 60 * int(res.totalMinutes));
    return res;
}

const START = "start",
    RESTART = "restart",
    START_PAUSE = "start_pause",
    PAUSE = "pause",
    STOP = "stop",
    NONE = "";

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
    volume: 1,
    started: false,
    blink: false,
    sequence: [],
    canAlert: true,
    start: function () {
        if (Egg.started) {
            return;
        }
        Egg.started = true;
        Egg.initializeTimer2("Expired!");
    },
    initializeTimer2: function (label) {
        Egg.currDate = new Date();
        Egg.endDate = new Date(Egg.currDate.getTime() + Egg.totalTime);
        Egg.expiredMessage = label || Egg.expiredMessage;
        Egg.progressBar.style.transitionDuration = (Egg.totalTime / 1000) + "s";
        Egg.progressBar.classList.add('active');
        Egg.update(Egg.currDate);
        if (!Egg.ticker) {
            Egg.ticker = setInterval(Egg.update, 1e3 / 2)
        }
    },
    update: function (begin = new Date()) {
        Egg.updateParts(calcTime(begin, Egg.endDate));
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
        let separator = Egg.blink ? "." : ":";
        Egg.blink = !Egg.blink;
        let title = clockTime.join(separator) + (Egg.label && Egg.label !== "" ? " : " + Egg.label : "");
        Egg.updateTitle(title);
        Egg.updateText(title);
        Egg.progress = (Egg.totalTime - Time.totalMilliseconds) / Egg.totalTime;
        Egg.updateProgressBar();
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
        Egg.progress = 1;
        Egg.updateProgressBar();
        Egg.started = false;
        if (Egg.beep && Egg.beep.play) {
            Egg.beep.volume = Egg.volume;
            Egg.beep.play();
        }
        clearInterval(Egg.ticker);
        Egg.ticker = null;
        Egg.updateTitle(Egg.expiredMessage);
        Egg.progressText.innerHTML = "&#x1F570;";
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
        Egg.start();
    } else if (code === RESTART) {
        Egg.started = false;
        Egg.start();
    } else if (code === START_PAUSE) {
        if (!Egg.started) {
            Egg.start();
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
    Egg.beep = document.getElementById("beepbeep");
    Egg.progressBar.style.transitionDuration = (Egg.totalTime / 1000) + "s";
    document.body.addEventListener('click', Egg.start, false);
    window.addEventListener('keydown', onKeyPress);
    const begin = new Date();
    Egg.endDate = new Date(begin.getTime() + Egg.totalTime);
    Egg.update(begin);

    if (Egg.beep && Egg.beep.load) {
        Egg.beep.load();
    }
    Egg.beep.addEventListener('ended', function () {
        if (Egg.started) {
            return;
        }
        Egg.progressBar.style.transitionDuration = "0.5s";
        Egg.progressBar.classList.remove('active');
    });
}

if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener("DOMContentLoaded", function (event) {
        init();
    });
}
})();
