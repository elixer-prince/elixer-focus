import onClickSoundURL from "./../../assets/audio/sound-effects/on-click.mp3";
import offClickSoundURL from "./../../assets/audio/sound-effects/off-click.mp3";
import tickingSoundURL from "./../../assets/audio/sound-effects/ticking.mp3";
import beepSoundURL from "./../../assets/audio/sound-effects/beep.mp3";
import resetTimerSoundURL from "./../../assets/audio/sound-effects/reset-timer.mp3";

document.addEventListener('alpine:init', () => {
    Alpine.data('countdownTimer', () => ({
        // TIMER VARIABLES
        endTime: 0,
        interval: null,
        intervalStarted: false,
        isBreak: false,
        currentSessionCount: 0,
        totalSessionsCompleted: 0,
        remainingTimeInSeconds: 0,
        timerPaused: true,

        // SOUND EFFECTS
        onClickSoundEffect: null,
        offClickSoundEffect: null,
        tickingSoundEffect: null,
        beepSoundEffect: null,
        resetTimerSoundEffect: null,

        /**
         * The start time in minutes that will be converted to seconds.
         *
         * This is calculated based on if the user has completed an amount of
         * sessions that is equal to that of the session count limit.
         *
         * @returns {number} The minutes to be converted to seconds.
         */
        get startTimeInMinutes() {
            if (this.isBreak)
                return this.currentSessionCount < this.$store.countdownTimerSettings.sessionCountLimit
                    ? this.$store.countdownTimerSettings.shortBreakDuration
                    : this.$store.countdownTimerSettings.longBreakDuration;

            return this.$store.countdownTimerSettings.focusDuration;
        },

        /**
         * The start time in seconds that will be formatted and displayed on
         * the timer display.
         *
         * This is calculated based on the start time in minutes and changes dynamically
         * with the start time in minutes.
         *
         * @returns {number} The start time in minutes converted to seconds.
         * */
        get startTimeInSeconds() {
            return this.$store.timerFunctions.convertMinutesToSeconds(this.startTimeInMinutes);
        },

        init() {
            this.initialiseVariables();
            this.watchVariables();

            if (this.timerPaused && !this.intervalStarted) return;

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
                JSON.parse(localStorage.getItem('remainingTimeInSeconds')) ||
                this.startTimeInSeconds;

            this.currentSessionCount =
               JSON.parse(localStorage.getItem('currentSessionCount')) || 0;

            this.totalSessionsCompleted =
                JSON.parse(localStorage.getItem('totalSessionsCompleted')) || 0;

            this.isBreak =
                localStorage.getItem('isBreak')
                    ? JSON.parse(localStorage.getItem('isBreak'))
                    : false;

            this.intervalStarted =
                localStorage.getItem('intervalStarted')
                    ? JSON.parse(localStorage.getItem('intervalStarted'))
                    : false;

            this.timerPaused =
                localStorage.getItem('timerPaused')
                    ? JSON.parse(localStorage.getItem('timerPaused'))
                    : true;

            this.endTime = JSON.parse(localStorage.getItem('endTime')) || null;
        },

        watchVariables() {
            this.$watch('remainingTimeInSeconds', (value) => {
                localStorage.setItem('remainingTimeInSeconds', JSON.stringify(value));
            });

            this.$watch('currentSessionCount', (value) => {
                localStorage.setItem('currentSessionCount', JSON.stringify(value));
            });

            this.$watch('totalSessionsCompleted', (value) => {
                localStorage.setItem('totalSessionsCompleted', JSON.stringify(value));
            });

            this.$watch('isBreak', (value) => {
                localStorage.setItem('isBreak', JSON.stringify(value));
            });

            this.$watch('timerPaused', (value) => {
                localStorage.setItem('timerPaused', JSON.stringify(value));
            });

            this.$watch('intervalStarted', (value) => {
                localStorage.setItem('intervalStarted', JSON.stringify(value));
            });

            this.$watch('endTime', (value) => {
                localStorage.setItem('endTime', JSON.stringify(value));
            });
        },

        /*
        |---------------------------------
        | TIMER CONTROLS
        |---------------------------------
        |
        */

        startCountdown() {
            // Calculate the end time based on the current time and remaining time
            // because browser throttling makes decrementing inaccurate.
            this.endTime = Date.now() + this.remainingTimeInSeconds * 1000;

            this.startInterval();
        },
        startCountDownOnRefresh() {
            if (this.timerPaused && this.intervalStarted) return;

            this.startCountdown()
        },
        startCountdownWithSound() {
            if (this.intervalStarted && !this.timerPaused) return;

            this.$store.utilityFunctions.playSound(this.onClickSoundEffect);
            this.startCountdown();
        },

        pauseCountdown() {
            if (!this.intervalStarted || this.timerPaused) return;

            this.timerPaused = true;
            this.$store.utilityFunctions.playSound(this.offClickSoundEffect);
            this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);
            this.destroyInterval();
        },

        resetCountdown() {
            if (this.intervalStarted) {
                this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);
                this.intervalStarted = false;
                this.destroyInterval();
            }

            this.timerPaused = true;
            this.remainingTimeInSeconds = this.startTimeInSeconds;
        },
        resetCountdownWithSound() {
            if (!this.intervalStarted)
                return alert("The timer isn't running!");

            if (confirm("Are you sure you want to reset the timer?")) {
                if (this.intervalStarted)
                    this.$store.utilityFunctions.playSound(this.resetTimerSoundEffect);

                this.resetCountdown();
            }
        },

        /**
         * Skips the timer before it ends if it is running.
         */
        skipCountdown() {
            if (!this.intervalStarted)
                return alert("The timer isn't running!");

            if (confirm("Are you sure you want to skip the current session?")) {
                this.$store.utilityFunctions.playSound(this.resetTimerSoundEffect);
                this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);

                if (!this.isBreak) {
                    this.currentSessionCount++;
                    this.totalSessionsCompleted++;
                }

                this.destroyInterval();
                this.intervalStarted = false;
                this.timerPaused = true;

                this.toggleSessionType();

                this.remainingTimeInSeconds = this.startTimeInSeconds;

                if (this.currentSessionCount >= this.$store.countdownTimerSettings.sessionCountLimit)
                    this.resetCurrentSessionCount();
            }
        },

        /*
        |-----------------------------------------------------
        | HELPER METHODS
        |-----------------------------------------------------
        |
        */

        // INTERVAL CONTROLS

        startInterval() {
            this.timerPaused = false;
            this.intervalStarted = true;

            let tickingStarted = false;

            this.interval = setInterval(() => {
                this.updateRemainingTimeInSeconds();

                if (this.remainingTimeInSeconds <= 5 && !tickingStarted) {
                    tickingStarted = true;
                    this.$store.utilityFunctions.playSound(this.tickingSoundEffect);
                }

                if (this.remainingTimeInSeconds > 5 && tickingStarted) {
                    tickingStarted = false;
                    this.$store.utilityFunctions.stopSound(this.tickingSoundEffect);
                }

                if (this.remainingTimeInSeconds <= 0) {
                    if (!this.isBreak) {
                        this.currentSessionCount++;
                        this.totalSessionsCompleted++;
                    }

                    this.toggleSessionType();
                    this.resetCountdown();
                    this.$store.utilityFunctions.playSound(this.beepSoundEffect);

                    if (this.currentSessionCount >= this.$store.countdownTimerSettings.sessionCountLimit)
                        this.resetCurrentSessionCount();

                    // The timeout is set to one second because the alert
                    // would block the sound from playing immediately otherwise.
                    return setTimeout(() => alert("Time's up!"), 1000);
                }
            }, 1000);
        },

        /**
         * Destroy the existing timer interval.
         */
        destroyInterval() {
            clearInterval(this.interval);
        },

        // SESSION CONTROLS

        /**
         * Toggle the session type.
         *
         * If the session is a break session it switched to a focus session
         * and vice versa.
         */
        toggleSessionType() {
            this.isBreak = !this.isBreak;
        },
        toggleSessionTypeWithConfirmation() {
            if (confirm("Are you sure you want to switch the session type?")) {
                this.toggleSessionType();
                this.resetCountdown();
            }
        },

        // TIMER CONTROLS

        /**
         * Updates the remaining time in seconds based on the end time.
         */
        updateRemainingTimeInSeconds() {
            this.remainingTimeInSeconds = Math.max(
                0,
                Math.round((this.endTime - Date.now()) / 1000),
            );
        },

        /**
         * Resets the current session count back to zero.
         */
        resetCurrentSessionCount() {
            this.currentSessionCount = 0;
        },
    }));
});
