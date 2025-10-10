import onClickSoundURL from "./../../assets/audio/sound-effects/on-click.mp3";
import offClickSoundURL from "./../../assets/audio/sound-effects/off-click.mp3";
import tickingSoundURL from "./../../assets/audio/sound-effects/ticking.mp3";
import beepSoundURL from "./../../assets/audio/sound-effects/beep.mp3";
import resetTimerSoundURL from "./../../assets/audio/sound-effects/reset-timer.mp3";

document.addEventListener('alpine:init', () => {
    Alpine.data('countdownTimer', () => ({
        endTime: 0,
        interval: null,
        intervalStarted: false,
        isBreak: false,
        currentSessionCount: 0,
        remainingTimeInSeconds: 0,
        timerPaused: true,

        // Sound Effects
        onClickSoundEffect: null,
        offClickSoundEffect: null,
        tickingSoundEffect: null,
        beepSoundEffect: null,
        resetTimerSoundEffect: null,

        /**
         * The start time in minutes that will be converted to seconds.
         *
         * This is calculated based on if the user has completed an amount of session
         * that is equal to that of the session count limit. The session count limit.
         *
         * @returns {number} The minutes to be converted to seconds.
         */
        get startTimeInMinutes() {
            /*
                FIXME: The timer looks incorrectly formatted if there is a non-perfect
                 decimal or a decimal with more than two places of precision s provided.

                TODO: I might fix the check for pomodoro session limit here.
            */
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
            return this.convertMinutesToSeconds(this.startTimeInMinutes);
        },

        init() {
            this.initialiseVariables();
            this.watchVariables();

            if (this.timerPaused && !this.intervalStarted) return;

            this.startCountdown();
        },

        initialiseVariables() {
            // Sound Effects
            this.onClickSoundEffect = new Audio(onClickSoundURL);
            this.offClickSoundEffect = new Audio(offClickSoundURL);
            this.tickingSoundEffect = new Audio(tickingSoundURL);
            this.beepSoundEffect = new Audio(beepSoundURL);
            this.resetTimerSoundEffect = new Audio(resetTimerSoundURL);

            // Timer
            this.remainingTimeInSeconds =
                Number(localStorage.getItem('remainingTimeInSeconds')) ||
                this.startTimeInSeconds;

            this.currentSessionCount =
                Number(localStorage.getItem('currentSessionCount')) || 0;

            this.isBreak =
                this.toBool(localStorage.getItem('isBreak')) || false;

            this.intervalStarted =
                this.toBool(localStorage.getItem('intervalStarted')) || false;

            this.timerPaused =
                this.toBool(localStorage.getItem('timerPaused')) || true;

            this.endTime = Number(localStorage.getItem('endTime')) || null;
        },

        watchVariables() {
            this.$watch('remainingTimeInSeconds', (value) => {
                localStorage.setItem('remainingTimeInSeconds', value);
            });

            this.$watch('currentSessionCount', (value) => {
                localStorage.setItem('currentSessionCount', value);
            });

            this.$watch('isBreak', (value) => {
                localStorage.setItem('isBreak', value);
            });

            this.$watch('timerPaused', (value) => {
                localStorage.setItem('timerPaused', value);
            });

            this.$watch('intervalStarted', (value) => {
                localStorage.setItem('intervalStarted', value);
            });

            this.$watch('endTime', (value) => {
                localStorage.setItem('endTime', value);
            });
        },

        /*
        |---------------------------------
        | Timer Controls
        |---------------------------------
        |
        */

        startCountdown() {
            if (this.intervalStarted && !this.timerPaused) return;

            // Calculate the end time based on the current time and remaining time
            // because browser throttling makes decrementing inaccurate.
            this.endTime = Date.now() + this.remainingTimeInSeconds * 1000;

            this.startInterval();
        },
        startCountdownWithSound() {
            if (this.timerPaused) this.playOnClickSound();
            this.startCountdown();
        },
        pauseCountdown() {
            if (!this.intervalStarted || this.timerPaused) return;

            this.timerPaused = true;
            this.playOffClickSound();
            this.stopTickingSound();
            this.destroyInterval();
        },
        resetCountdown() {
            if (this.intervalStarted) {
                this.stopTickingSound();
                this.intervalStarted = false;
                this.destroyInterval();
            }

            this.timerPaused = true;
            this.remainingTimeInSeconds = this.startTimeInSeconds;
        },
        resetCountdownWithSound() {
            if (confirm("Are you sure you want to reset the timer?")) {
                if (this.intervalStarted)
                    this.playResetTimerSoundEffect();

                this.resetCountdown();
            }
        },

        /*
        |---------------------------------
        | Sound Methods
        |---------------------------------
        |
        */

        /*
            TODO: Give the user the ability to choose the sound used here.
             Each theme could have predefined sounds but there could be
             a mixed theme that allows aspects from each theme.
         */
        playBeepSound() {
            this.beepSoundEffect.play();
        },
        playOnClickSound() {
            this.onClickSoundEffect.play();
        },
        playOffClickSound() {
            this.offClickSoundEffect.play();
        },
        playTickingSound() {
            this.tickingSoundEffect.play();
        },
        stopTickingSound() {
            this.tickingSoundEffect.pause();
            this.tickingSoundEffect.currentTime = 0;
        },
        playResetTimerSoundEffect() {
            this.resetTimerSoundEffect.play();
        },

        /*
        |-----------------------------------------------------
        | Helper Methods
        |-----------------------------------------------------
        |
        */

        // TODO: Clean this function up!
        startInterval() {
            this.timerPaused = false;
            this.intervalStarted = true;

            let tickingStarted;

            this.interval = setInterval(() => {
                this.remainingTimeInSeconds = Math.max(
                    0,
                    Math.round((this.endTime - Date.now()) / 1000),
                );

                if (this.remainingTimeInSeconds <= 5 && !tickingStarted) {
                    tickingStarted = true;
                    this.playTickingSound();
                }

                if (this.remainingTimeInSeconds > 5 && tickingStarted) {
                    tickingStarted = false;
                    this.stopTickingSound();
                }

                if (this.remainingTimeInSeconds <= 0) {
                    if (!this.isBreak) this.currentSessionCount++;

                    this.toggleSessionType();
                    this.resetCountdown();
                    this.playBeepSound();

                    if (this.currentSessionCount >= 4) this.currentSessionCount = 0;

                    // TODO: Send a notification or email that the timer ended
                    // TODO:Maybe make this user defined in the future

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
            if (confirm("Are you sure you want to switch the session type?"))
                this.toggleSessionType();
        },

        /**
         * Formats the seconds provided to a human-readable string value.
         *
         * @param {number} seconds - The seconds to be formatted.
         * @returns {string} The seconds formatted as a string.
         */
        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secondsRemainder = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${secondsRemainder.toString().padStart(2, '0')}`;
        },

        /**
         * Converts minutes to seconds.
         *
         * @param {number} minutes - The minutes to be converted to seconds.
         * @returns {number} Seconds converted from minutes.
         */
        convertMinutesToSeconds(minutes) {
            return minutes * 60;
        },

        /**
         * This turns the value provided into a boolean.
         *
         * @param value - The value to be converted.
         * @returns {boolean} The result of the conversion.
         */
        toBool(value) {
            return value === 'true';
        },
    }));
});
