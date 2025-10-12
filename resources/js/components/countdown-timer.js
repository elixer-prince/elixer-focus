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
            return this.convertMinutesToSeconds(this.startTimeInMinutes);
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
            if (this.intervalStarted && !this.timerPaused) return;

            // Calculate the end time based on the current time and remaining time
            // because browser throttling makes decrementing inaccurate.
            this.endTime = Date.now() + this.remainingTimeInSeconds * 1000;

            this.startInterval();
        },
        startCountDownOnRefresh() {
            console.log(`timerPaused: ${this.timerPaused}\nintervalStarted: ${this.intervalStarted}`);
            if (!this.timerPaused && this.intervalStarted) return;

            // this.startCountdown()

            alert('no')
        },
        startCountdownWithSound() {
            if (this.timerPaused) this.playSound(this.onClickSoundEffect);
            this.startCountdown();
        },
        pauseCountdown() {
            if (!this.intervalStarted || this.timerPaused) return;

            this.timerPaused = true;
            this.playSound(this.offClickSoundEffect);
            this.stopSound(this.tickingSoundEffect);
            this.destroyInterval();
        },
        resetCountdown() {
            if (this.intervalStarted) {
                this.stopSound(this.tickingSoundEffect);
                this.intervalStarted = false;
                this.destroyInterval();
            }

            this.timerPaused = true;
            this.remainingTimeInSeconds = this.startTimeInSeconds;
        },
        resetCountdownWithSound() {
            if (this.intervalStarted) {
                if (confirm("Are you sure you want to reset the timer?")) {
                    if (this.intervalStarted)
                        this.playSound(this.resetTimerSoundEffect);

                    this.resetCountdown();
                }
            } else {
                alert("The timer isn't running!");
            }
        },

        /*
        |-----------------------------------------------------
        | HELPER METHODS
        |-----------------------------------------------------
        |
        */

        startInterval() {
            this.timerPaused = false;
            this.intervalStarted = true;

            let tickingStarted = false;

            this.interval = setInterval(() => {
                this.updateRemainingTimeInSeconds();

                if (this.remainingTimeInSeconds <= 5 && !tickingStarted) {
                    tickingStarted = true;
                    this.playSound(this.tickingSoundEffect);
                }

                if (this.remainingTimeInSeconds > 5 && tickingStarted) {
                    tickingStarted = false;
                    this.stopSound(this.tickingSoundEffect);
                }

                if (this.remainingTimeInSeconds <= 0) {
                    if (!this.isBreak) this.currentSessionCount++;

                    this.toggleSessionType();
                    this.resetCountdown();
                    this.playSound(this.beepSoundEffect);

                    if (this.currentSessionCount >= this.$store.countdownTimerSettings.sessionCountLimit)
                        this.resetCurrentSessionCount();

                    // The timeout is set to one second because the alert
                    // would block the sound from playing immediately otherwise.
                    return setTimeout(() => alert("Time's up!"), 1000);
                }
            }, 1000);
        },

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
            if (confirm("Are you sure you want to switch the session type?")) {
                this.toggleSessionType();
                this.resetCountdown();
            }
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

        /**
         * Plays the specified sound.
         *
         * This method takes the URL path of a sound and plays it from
         * the beginning.
         *
         * @param effect - The sound effect to be played.
         */
        playSound(effect) {
            effect.currentTime = 0;
            effect.play();
        },

        /**
         * Stops the specified sound.
         *
         * This function pauses the specified sound effect and reset the
         * current time to zero to simulate stopping.
         *
         * @param effect - The sound effect to be stopped.
         */
        stopSound(effect) {
            effect.pause();
            effect.currentTime = 0;
        },
    }));
});
