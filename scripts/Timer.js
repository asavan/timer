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

const Timer = {
    name: "BestTimer",
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
    endImage: null,
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
        if (Timer.started) {
            return;
        }
        Timer.started = true;
        Timer.initializeTimer2("Expired!");
    },
    initializeTimer2: function (label) {
        Timer.currDate = new Date();
        Timer.endDate = new Date(Timer.currDate.getTime() + Timer.totalTime);
        Timer.expiredMessage = label || Timer.expiredMessage;
        Timer.progressBar.style.transitionDuration = (Timer.totalTime / 1000) + "s";
        Timer.progressBar.classList.add('active');
        Timer.progressText.classList.remove('hidden');
        Timer.endImage.classList.add('hidden');
        Timer.update(Timer.currDate);
        if (!Timer.ticker) {
            Timer.ticker = setInterval(Timer.update, 1e3 / 2)
        }
    },
    update: function (begin = new Date()) {
        Timer.updateParts(calcTime(begin, Timer.endDate));
    },
    updateParts: function (Time) {
        if (Time.totalSeconds < 0) {
            Timer.onTimeComplete();
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
        let separator = Timer.blink ? "." : ":";
        Timer.blink = !Timer.blink;
        let title = clockTime.join(separator) + (Timer.label && Timer.label !== "" ? " : " + Timer.label : "");
        Timer.updateTitle(title);
        Timer.updateText(title);
        Timer.progress = (Timer.totalTime - Time.totalMilliseconds) / Timer.totalTime;
        Timer.updateProgressBar();
    },
    updateTitle: function (title) {
        document.title = title;
    },
    updateProgressBar: function () {
    },
    updateText: function (text) {
        if (text) Timer.progressText.innerText = text;
    },
    onTimeComplete: function () {
        Timer.progress = 1;
        Timer.updateProgressBar();
        Timer.started = false;
        if (Timer.beep && Timer.beep.play) {
            Timer.beep.volume = Timer.volume;
            Timer.beep.play();
        }
        clearInterval(Timer.ticker);
        Timer.ticker = null;
        Timer.updateTitle(Timer.expiredMessage);
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
    // console.log(code);
    if (code === START) {
        Timer.start();
    } else if (code === RESTART) {
        Timer.started = false;
        Timer.start();
    } else if (code === START_PAUSE) {
        if (!Timer.started) {
            Timer.start();
        } else {
            Timer.pause();
        }
    }
}


function padTimeText(value) {
    return value < 10 ? "0" + value : "" + value
}

function init() {
    const hash = window.location.href.split('#')[1] || 4;
    Timer.totalTime = hash * 60000;
    Timer.progressBar = document.querySelector("#progress");
    Timer.progressText = document.querySelector(".time-field");
    Timer.endImage = document.querySelector(".ended");
    Timer.beep = document.getElementById("beepbeep");
    Timer.progressBar.style.transitionDuration = (Timer.totalTime / 1000) + "s";
    document.body.addEventListener('click', Timer.start, false);
    window.addEventListener('keydown', onKeyPress);
    const begin = new Date();
    Timer.endDate = new Date(begin.getTime() + Timer.totalTime);
    Timer.update(begin);

    if (Timer.beep && Timer.beep.load) {
        Timer.beep.load();
    }
    Timer.beep.addEventListener('ended', function () {
        if (Timer.started) {
            return;
        }
        Timer.progressBar.style.transitionDuration = "0.3s";
        Timer.progressBar.classList.remove('active');
        Timer.progressText.classList.add('hidden');
        Timer.endImage.classList.remove('hidden');
    });
}

if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener("DOMContentLoaded", function (event) {
        init();
    });
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', {scope: './'});
}
})();
