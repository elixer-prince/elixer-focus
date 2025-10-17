import onClickSoundURL from "./../../assets/audio/sound-effects/on-click.mp3";
import offClickSoundURL from "./../../assets/audio/sound-effects/off-click.mp3";
import tickingSoundURL from "./../../assets/audio/sound-effects/ticking.mp3";
import beepSoundURL from "./../../assets/audio/sound-effects/beep.mp3";
import resetTimerSoundURL from "./../../assets/audio/sound-effects/reset-timer.mp3";

document.addEventListener("alpine:init", () => {
    Alpine.data("countdownTimer", () => ({
        // TIMER VARIABLES
        currentSessionCount: 0,
        endTime: 0,
        interval: null,
        intervalStarted: false,
        isBreak: false,
        remainingTimeInSeconds: 0,
        timerPaused: true,
        totalSessionsCompleted: 0,
        totalStartTimeInSeconds: 0,

        // SOUND EFFECTS
        beepSoundEffect: null,
        offClickSoundEffect: null,
        onClickSoundEffect: null,
        resetTimerSoundEffect: null,
        tickingSoundEffect: null,

        get startTimeInMinutes() {
            if (this.currentSessionIsBreak())
                return this.currentSessionCount < this.getSessionCountLimit()
                    ? this.getShortBreakDuration()
                    : this.getLongBreakDuration();

            return this.getFocusDuration();
        },

        get startTimeInSeconds() {
            return this.$store.timerFunctions.convertMinutesToSeconds(
                this.startTimeInMinutes,
            );
        },

        init() {
            this.initialiseTimerState();
            this.watchTimerState();

            if (this.timerIsNotRunningAndIsPaused()) return;

            if (this.timerIsRunning())
                this.displayCountdownTimeRemainingInPageTitle();

            this.startCountDownOnRefresh();
        },

        initialiseTimerState() {
            this.initialiseSoundEffects();
            this.InitialiseTimerVariables();
        },

        initialiseSoundEffects() {
            this.onClickSoundEffect = new Audio(onClickSoundURL);
            this.offClickSoundEffect = new Audio(offClickSoundURL);
            this.tickingSoundEffect = new Audio(tickingSoundURL);
            this.beepSoundEffect = new Audio(beepSoundURL);
            this.resetTimerSoundEffect = new Audio(resetTimerSoundURL);
        },

        initialiseTimerVariables() {
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

        watchTimerState() {
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
            this.initialiseTimer();
        },

        startCountDownOnRefresh() {
            if (this.timerIsRunningButIsPaused()) return;

            this.startCountdown();
        },

        startCountdownWithSound() {
            if (this.timerIsRunningAndNotPaused()) return;

            this.playOnClickSoundEffect();
            this.startCountdown();
        },

        pauseCountdown() {
            if (this.timerIsNotRunningOrIsPaused()) return;

            this.stopTickingSoundEffect();
            this.playOffClickSoundEffect();
            this.pauseTimer();
            this.destroyInterval();
        },

        resetCountdown() {
            if (this.timerIsRunning()) {
                this.stopTickingSoundEffect();
                this.resetPageTitleToDefault();
                this.setEndTime();
                this.resetRemainingTime();
                this.stopAndDestroyInterval();
                this.pauseTimer();
            }
        },
        resetCountdownWithSound() {
            if (this.timerIsNotRunning())
                return this.informUserOfTimerNotRunning();

            if (confirm("Are you sure you want to reset the timer?")) {
                this.playResetTimerSoundEffect();
                this.resetCountdown();
            }
        },

        skipCountdown() {
            if (this.timerIsNotRunning())
                return this.informUserOfTimerNotRunning();

            if (confirm("Are you sure you want to skip the current session?")) {
                this.playResetTimerSoundEffect();
                this.stopTickingSoundEffect();

                if (this.currentSessionIsFocus())
                    this.incrementSessionCountAndTotalSessionsCompleted();

                this.pauseTimer();
                this.stopAndDestroyInterval();
                this.toggleSessionType();
                this.resetCountdown();
                this.resetRemainingTime();
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
            this.interval = setInterval(() => {
                this.updateRemainingSeconds();

                if (this.timerIsAboutToEnd()) this.playTickingSoundEffect();
                if (this.timerIsNotAboutToEnd()) this.stopTickingSoundEffect();

                if (this.timerHasEnded()) {
                    this.incrementSessionIfFocus();

                    this.toggleSessionType();
                    this.resetCountdown();
                    this.playBeepSoundEffect();

                    return this.informUserOfTimerEnd();
                }
            }, 1000);
        },

        createAndStartInterval() {
            this.createInterval();
            this.startInterval();
        },

        destroyInterval() {
            clearInterval(this.interval);
        },

        stopAndDestroyInterval() {
            this.stopInterval();
            this.destroyInterval();
        },

        //--------------------------------------------------------------
        // PROVIDE USER FEEDBACK
        //--------------------------------------------------------------

        informUserOfTimerEnd() {
            // Delayed by one second because the alert would block sounds otherwise.
            setTimeout(() => alert("Time's up!"), 1000);
        },

        informUserOfTimerNotRunning() {
            alert("The timer isn't running!");
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

        incrementSessionIfFocus() {
            if (this.currentSessionIsFocus())
                this.incrementSessionCountAndTotalSessionsCompleted();
        },

        // Session Checks

        currentSessionIsFocus() {
            return !this.isBreak;
        },

        currentSessionIsBreak() {
            return this.isBreak;
        },

        // TIMER CHECKS

        // Basic Checks

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

        timerIsNotPaused() {
            return !this.timerPaused;
        },

        timerIsPaused() {
            return this.timerPaused;
        },

        // Compound Checks

        timerIsNotRunningAndIsPaused() {
            return this.timerIsNotRunning() && this.timerIsPaused();
        },

        timerIsNotRunningOrIsPaused() {
            return this.timerIsNotRunning() || this.timerIsPaused();
        },

        timerIsRunningButIsPaused() {
            return this.timerIsRunning() && this.timerIsPaused();
        },

        timerIsRunningAndNotPaused() {
            return this.timerIsRunning() && this.timerIsNotPaused();
        },

        // TIMER PLAYBACK

        initialiseTimer() {
            this.unpauseTimer();
            this.createAndStartInterval();
        },

        pauseTimer() {
            this.timerPaused = true;
        },

        unpauseTimer() {
            this.timerPaused = false;
        },

        // Handling Remaining Time

        updateRemainingSeconds() {
            this.remainingTimeInSeconds =
                this.calculateRemainingSecondsBasedOnEndTime();
        },

        resetRemainingTime() {
            this.remainingTimeInSeconds = this.startTimeInSeconds;
        },

        calculateRemainingSecondsBasedOnEndTime() {
            return Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
        },

        getRemainingTimeInMinutesAndSeconds() {
            return this.$store.timerFunctions.formatTimeInMinutesAndSeconds(
                this.remainingTimeInSeconds,
            );
        },

        // Handling end time

        calculateEndTime() {
            // Calculate the end time based on the current time and remaining time
            // because browser throttling makes decrementing inaccurate.
            return Date.now() + this.remainingTimeInSeconds * 1000;
        },

        setEndTime() {
            this.endTime = this.calculateEndTime();
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

        //---------------------------------------------------------------
        // GET STORE VALUES
        //---------------------------------------------------------------

        getSessionCountLimit() {
            return this.$store.countdownTimerSettings.sessionCountLimit;
        },

        getFocusDuration() {
            return this.$store.countdownTimerSettings.focusDuration;
        },

        getShortBreakDuration() {
            return this.$store.countdownTimerSettings.shortBreakDuration;
        },

        getLongBreakDuration() {
            return this.$store.countdownTimerSettings.longBreakDuration;
        },
    }));
});
