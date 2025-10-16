import onClickSoundURL from "./../../assets/audio/sound-effects/on-click.mp3";
import offClickSoundURL from "./../../assets/audio/sound-effects/off-click.mp3";
import tickingSoundURL from "./../../assets/audio/sound-effects/ticking.mp3";
import beepSoundURL from "./../../assets/audio/sound-effects/beep.mp3";
import resetTimerSoundURL from "./../../assets/audio/sound-effects/reset-timer.mp3";

document.addEventListener("alpine:init", () => {
    Alpine.data("countdownTimer", () => ({
        // TIMER VARIABLES
        endTime: 0,
        interval: null,
        intervalStarted: false,
        isBreak: false,
        currentSessionCount: 0,
        totalSessionsCompleted: 0,
        remainingTimeInSeconds: 0,
        timerPaused: true,
        totalStartTimeInSeconds: 0,

        // SOUND EFFECTS
        onClickSoundEffect: null,
        offClickSoundEffect: null,
        tickingSoundEffect: null,
        beepSoundEffect: null,
        resetTimerSoundEffect: null,

        get startTimeInMinutes() {
            if (this.isBreak)
                return this.currentSessionCount <
                    this.$store.countdownTimerSettings.sessionCountLimit
                    ? this.$store.countdownTimerSettings.shortBreakDuration
                    : this.$store.countdownTimerSettings.longBreakDuration;

            return this.$store.countdownTimerSettings.focusDuration;
        },

        get startTimeInSeconds() {
            return this.$store.timerFunctions.convertMinutesToSeconds(
                this.startTimeInMinutes,
            );
        },

        init() {
            this.initialiseVariables();
            this.watchVariables();

            // If the timer wasn't running and is currently paused do nothing.
            if (this.timerPaused && !this.intervalStarted) return;

            // Otherwise, if it was running display the remaining time in
            // the title.
            if (this.intervalStarted)
                this.displayCountdownTimeRemainingInPageTitle();

            // Otherwise, start the countdown.
            this.startCountDownOnRefresh();
        },

        initialiseVariables() {
            // SOUND EFFECTS
            this.onClickSoundEffect = new Audio(onClickSoundURL);
            this.offClickSoundEffect = new Audio(offClickSoundURL);
            this.tickingSoundEffect = new Audio(tickingSoundURL);
            this.beepSoundEffect = new Audio(beepSoundURL);
            this.resetTimerSoundEffect = new Audio(resetTimerSoundURL);

            // TIMER VARIABLES
            this.remainingTimeInSeconds =
                JSON.parse(localStorage.getItem("remainingTimeInSeconds")) ||
                this.startTimeInSeconds;

            this.currentSessionCount =
                JSON.parse(localStorage.getItem("currentSessionCount")) || 0;

            this.totalSessionsCompleted =
                JSON.parse(localStorage.getItem("totalSessionsCompleted")) || 0;

            this.isBreak = localStorage.getItem("isBreak")
                ? JSON.parse(localStorage.getItem("isBreak"))
                : false;

            this.intervalStarted = localStorage.getItem("intervalStarted")
                ? JSON.parse(localStorage.getItem("intervalStarted"))
                : false;

            this.timerPaused = localStorage.getItem("timerPaused")
                ? JSON.parse(localStorage.getItem("timerPaused"))
                : true;

            this.endTime = JSON.parse(localStorage.getItem("endTime")) || null;

            this.totalStartTimeInSeconds = this.startTimeInSeconds;
        },

        watchVariables() {
            this.$watch("remainingTimeInSeconds", (value) => {
                localStorage.setItem(
                    "remainingTimeInSeconds",
                    JSON.stringify(value),
                );

                if (this.intervalStarted)
                    this.displayCountdownTimeRemainingInPageTitle();
            });

            this.$watch("currentSessionCount", (value) => {
                localStorage.setItem(
                    "currentSessionCount",
                    JSON.stringify(value),
                );

                if (
                    value >=
                    this.$store.countdownTimerSettings.sessionCountLimit
                )
                    this.resetSessionCount();
            });

            this.$watch("totalSessionsCompleted", (value) => {
                localStorage.setItem(
                    "totalSessionsCompleted",
                    JSON.stringify(value),
                );
            });

            this.$watch("isBreak", (value) => {
                localStorage.setItem("isBreak", JSON.stringify(value));
            });

            this.$watch("timerPaused", (value) => {
                localStorage.setItem("timerPaused", JSON.stringify(value));
            });

            this.$watch("intervalStarted", (value) => {
                localStorage.setItem("intervalStarted", JSON.stringify(value));
            });

            this.$watch("endTime", (value) => {
                localStorage.setItem("endTime", JSON.stringify(value));
            });

            this.$watch(
                () => this.$store.countdownTimerSettings.focusDuration,
                (newMinutes) => {
                    if (this.currentSessionIsFocus()) {
                        // Only adjust if currently a focus session
                        const newTotalStartTime =
                            this.$store.timerFunctions.convertMinutesToSeconds(
                                newMinutes,
                            );
                        const timeDiff =
                            newTotalStartTime - this.totalStartTimeInSeconds;

                        // Adjust remaining time by the difference but never less than zero
                        this.remainingTimeInSeconds = Math.max(
                            0,
                            this.remainingTimeInSeconds + timeDiff,
                        );

                        // Update total start time
                        this.totalStartTimeInSeconds = newTotalStartTime;

                        // Update endTime based on new remaining time
                        this.endTime =
                            Date.now() + this.remainingTimeInSeconds * 1000;

                        if (this.intervalStarted) {
                            this.destroyInterval();
                            this.startInterval();
                        } else {
                            this.displayCountdownTimeRemainingInPageTitle();
                        }
                    }
                },
            );

            // Similarly watch shortBreakDuration and longBreakDuration and adjust when `isBreak` is true

            this.$watch(
                () => this.$store.countdownTimerSettings.shortBreakDuration,
                (newMinutes) => {
                    if (
                        this.isBreak &&
                        this.currentSessionCount <
                            this.$store.countdownTimerSettings.sessionCountLimit
                    ) {
                        const newTotalStartTime =
                            this.$store.timerFunctions.convertMinutesToSeconds(
                                newMinutes,
                            );
                        const timeDiff =
                            newTotalStartTime - this.totalStartTimeInSeconds;
                        this.remainingTimeInSeconds = Math.max(
                            0,
                            this.remainingTimeInSeconds + timeDiff,
                        );
                        this.totalStartTimeInSeconds = newTotalStartTime;
                        this.endTime =
                            Date.now() + this.remainingTimeInSeconds * 1000;
                        if (this.intervalStarted) {
                            this.destroyInterval();
                            this.startInterval();
                        } else {
                            this.displayCountdownTimeRemainingInPageTitle();
                        }
                    }
                },
            );

            this.$watch(
                () => this.$store.countdownTimerSettings.longBreakDuration,
                (newMinutes) => {
                    if (
                        this.isBreak &&
                        this.currentSessionCount >=
                            this.$store.countdownTimerSettings.sessionCountLimit
                    ) {
                        const newTotalStartTime =
                            this.$store.timerFunctions.convertMinutesToSeconds(
                                newMinutes,
                            );
                        const timeDiff =
                            newTotalStartTime - this.totalStartTimeInSeconds;
                        this.remainingTimeInSeconds = Math.max(
                            0,
                            this.remainingTimeInSeconds + timeDiff,
                        );
                        this.totalStartTimeInSeconds = newTotalStartTime;
                        this.endTime =
                            Date.now() + this.remainingTimeInSeconds * 1000;
                        if (this.intervalStarted) {
                            this.destroyInterval();
                            this.startInterval();
                        } else {
                            this.displayCountdownTimeRemainingInPageTitle();
                        }
                    }
                },
            );
        },

        startCountdown() {
            this.setEndTime();
            this.startInterval();
        },
        startCountDownOnRefresh() {
            // If the timer was started but paused, do nothing.
            if (this.timerPaused && this.intervalStarted) return;

            this.startCountdown();
        },
        startCountdownWithSound() {
            // If the timer was started but not paused, do nothing.
            if (this.intervalStarted && !this.timerPaused) return;

            // Otherwise, the button sound is played before staring the timer.
            this.$store.utilityFunctions.playSound(this.onClickSoundEffect);
            this.startCountdown();
        },

        calculateEndTime() {
            // Calculate the end time based on the current time and remaining time
            // because browser throttling makes decrementing inaccurate.
            return Date.now() + this.remainingTimeInSeconds * 1000;
        },

        setEndTime() {
            this.endTime = this.calculateEndTime();
        },

        pauseCountdown() {
            // If the timer wasn't running or the timer is paused, do nothing.
            if (!this.intervalStarted || this.timerPaused) return;

            // Otherwise, the button sound is played and the timer is paused.
            this.timerPaused = true;
            this.$store.utilityFunctions.playSound(this.offClickSoundEffect);
            this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);
            this.destroyInterval();
        },

        resetCountdown() {
            // If the timer is running stop it before resetting to the
            // start time.
            if (this.intervalStarted) {
                this.resetPageTitleToDefault();
                this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);
                this.intervalStarted = false;
                this.destroyInterval();
                this.timerPaused = true;
            }

            // This is defined outside the if statement because the timer
            // should be reset the start time when the function is called,
            // even if it wasn't started.
            this.remainingTimeInSeconds = this.startTimeInSeconds;
        },
        resetCountdownWithSound() {
            // Alert the user if the timer isn't running.
            if (!this.intervalStarted) return alert("The timer isn't running!");

            if (confirm("Are you sure you want to reset the timer?")) {
                this.$store.utilityFunctions.playSound(
                    this.resetTimerSoundEffect,
                );
                this.resetCountdown();
            }
        },

        skipCountdown() {
            // Alert the user if the timer isn't running.
            if (!this.intervalStarted) return alert("The timer isn't running!");

            if (confirm("Are you sure you want to skip the current session?")) {
                this.$store.utilityFunctions.playSound(
                    this.resetTimerSoundEffect,
                );
                this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);

                if (this.currentSessionIsFocus()) {
                    this.currentSessionCount++;
                    this.totalSessionsCompleted++;
                }

                this.destroyInterval();
                this.intervalStarted = false;
                this.timerPaused = true;

                this.toggleSessionType();

                this.remainingTimeInSeconds = this.startTimeInSeconds;
            }
        },

        //---------------------------------------------------------------
        // INTERVAL CONTROLS
        //---------------------------------------------------------------

        startInterval() {
            this.startTimer();
            this.intervalStarted = true;

            let tickingStarted = false;

            this.createInterval(tickingStarted);
        },

        createInterval(tickingStarted) {
            this.interval = setInterval(() => {
                this.updateRemainingSeconds();

                if (this.remainingTimeInSeconds <= 5 && !tickingStarted) {
                    tickingStarted = true;
                    this.$store.utilityFunctions.playSound(
                        this.tickingSoundEffect,
                    );
                }

                if (this.remainingTimeInSeconds > 5 && tickingStarted) {
                    tickingStarted = false;
                    this.$store.utilityFunctions.stopSound(
                        this.tickingSoundEffect,
                    );
                }

                if (this.remainingTimeInSeconds <= 0) {
                    if (this.currentSessionIsFocus()) {
                        this.currentSessionCount++;
                        this.totalSessionsCompleted++;
                    }

                    this.toggleSessionType();
                    this.resetCountdown();
                    this.$store.utilityFunctions.playSound(
                        this.beepSoundEffect,
                    );

                    // The timeout is set to one second because the alert
                    // would block the sound from playing immediately otherwise.
                    return setTimeout(() => alert("Time's up!"), 1000);
                }
            }, 1000);
        },

        destroyInterval() {
            clearInterval(this.interval);
        },

        //---------------------------------------------------------------
        // SESSION CONTROLS
        //---------------------------------------------------------------

        resetSessionCount() {
            this.currentSessionCount = 0;
        },

        toggleSessionType() {
            this.isBreak = !this.isBreak;
        },

        toggleSessionTypeWithConfirmation() {
            if (confirm("Are you sure you want to switch the session type?")) {
                this.toggleSessionType();
                this.resetCountdown();
            }
        },

        // Session Checks

        currentSessionIsFocus() {
            return !this.isBreak;
        },

        //---------------------------------------------------------------
        // TIMER CONTROLS
        //---------------------------------------------------------------

        // Controlling Timer Playback

        startTimer() {
            this.timerPaused = false;
        },

        pauseTimer() {
            this.timerPaused = true;
        },

        // Handling Remaining Time

        updateRemainingSeconds() {
            this.remainingTimeInSeconds =
                this.calculateRemainingSecondsBasedOnEndTime();
        },

        calculateRemainingSecondsBasedOnEndTime() {
            return Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
        },

        getRemainingTimeInMinutesAndSeconds() {
            return this.$store.timerFunctions.formatTimeInMinutesAndSeconds(
                this.remainingTimeInSeconds,
            );
        },

        // Updating the page title

        displayCountdownTimeRemainingInPageTitle() {
            if (this.currentSessionIsFocus())
                return this.displayFocusTimeRemainingInPageTitle();

            this.displayBreakTimeRemainingInPageTitle();
        },

        displayFocusTimeRemainingInPageTitle() {
            document.title = `Time to focus: ${this.getRemainingTimeInMinutesAndSeconds()}`;
        },

        displayBreakTimeRemainingInPageTitle() {
            document.title = `Break left: ${this.getRemainingTimeInMinutesAndSeconds()}`;
        },

        resetPageTitleToDefault() {
            document.title = "Welcome to Elixer Focus";
        },
    }));
});
