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
            if (this.currentSessionIsBreak())
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
                            this.createInterval();
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
                        this.currentSessionIsBreak() &&
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
                            this.createInterval();
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
                        this.currentSessionIsBreak() &&
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
                            this.createInterval();
                        } else {
                            this.displayCountdownTimeRemainingInPageTitle();
                        }
                    }
                },
            );
        },

        startCountdown() {
            this.setEndTime();
            this.createInterval();
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
            this.playOnClickSoundEffect();
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
            this.playOffClickSoundEffect();
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
                this.playResetTimerSoundEffect();
                this.resetCountdown();
            }
        },

        skipCountdown() {
            if (this.timerIsNotRunning())
                return alert("The timer isn't running!");

            if (confirm("Are you sure you want to skip the current session?")) {
                this.playResetTimerSoundEffect();
                this.stopTickingSoundEffect();

                if (this.currentSessionIsFocus())
                    this.incrementSessionCountAndTotalSessionsCompleted();

                this.destroyInterval();
                this.intervalStarted = false;
                this.pauseTimer();

                this.toggleSessionType();

                this.remainingTimeInSeconds = this.startTimeInSeconds;
            }
        },

        //---------------------------------------------------------------
        // INTERVAL CONTROLS
        //---------------------------------------------------------------

        startInterval() {
            this.intervalStarted = true;
        },

        stopInterval() {
            this.intervalStarted = false;
        },

        createInterval() {
            this.startInterval();

            this.interval = setInterval(() => {
                this.updateRemainingSeconds();

                if (this.timerIsAboutToEnd()) this.playTickingSoundEffect();

                if (this.timerIsNotAboutToEnd()) this.stopTickingSoundEffect();

                if (this.timerHasEnded()) {
                    if (this.currentSessionIsFocus())
                        this.incrementSessionCountAndTotalSessionsCompleted();

                    this.toggleSessionType();
                    this.resetCountdown();
                    this.playBeepSoundEffect();

                    return this.informUserOfTimerEnd();
                }
            }, 1000);
        },

        destroyInterval() {
            clearInterval(this.interval);
        },

        //--------------------------------------------------------------
        // PROVIDE USER FEEDBACK
        //--------------------------------------------------------------

        informUserOfTimerEnd() {
            // Delayed by one second because the alert would block sounds otherwise.
            setTimeout(() => alert("Time's up!"), 1000);
        },

        //---------------------------------------------------------------
        // SESSION CONTROLS
        //---------------------------------------------------------------

        toggleSessionType() {
            this.isBreak = !this.isBreak;
        },

        toggleSessionTypeWithConfirmation() {
            if (confirm("Are you sure you want to switch the session type?")) {
                this.toggleSessionType();
                this.resetCountdown();
            }
        },

        resetSessionCount() {
            this.currentSessionCount = 0;
        },

        incrementSessionCountAndTotalSessionsCompleted() {
            this.incrementSessionCount();
            this.incrementTotalSessionsCompleted();
        },

        incrementSessionCount() {
            this.currentSessionCount++;
        },

        incrementTotalSessionsCompleted() {
            this.totalSessionsCompleted++;
        },

        // Session Checks

        currentSessionIsFocus() {
            return !this.isBreak;
        },

        currentSessionIsBreak() {
            return this.isBreak;
        },

        // Timer Checks

        timerIsAboutToEnd() {
            return this.remainingTimeInSeconds <= 5;
        },

        timerIsNotAboutToEnd() {
            return this.remainingTimeInSeconds > 5;
        },

        timerHasEnded() {
            return this.remainingTimeInSeconds <= 0;
        },

        timerIsRunning() {
            return this.intervalStarted;
        },

        timerIsNotRunning() {
            return !this.intervalStarted;
        },

        // Controlling Timer Playback

        startTimer() {
            this.timerPaused = false;
        },

        pauseTimer() {
            this.timerPaused = true;
        },

        initialiseTimer() {
            this.startTimer();
            this.createInterval();
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

        //---------------------------------------------------------------
        // SOUND CONTROLS
        //---------------------------------------------------------------

        // Start the sounds

        playBeepSoundEffect() {
            this.$store.utilityFunctions.playSound(this.beepSoundEffect);
        },

        playTickingSoundEffect() {
            this.$store.utilityFunctions.playSound(this.tickingSoundEffect);
        },

        playResetTimerSoundEffect() {
            this.$store.utilityFunctions.playSound(this.resetTimerSoundEffect);
        },

        playOnClickSoundEffect() {
            this.$store.utilityFunctions.playSound(this.onClickSoundEffect);
        },

        playOffClickSoundEffect() {
            this.$store.utilityFunctions.playSound(this.offClickSoundEffect);
        },

        // Stop the sounds

        stopTickingSoundEffect() {
            this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);
        },
    }));
});
