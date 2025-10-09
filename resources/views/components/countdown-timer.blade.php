<div x-data="countdownTimer">
    <div class="mx-auto flex w-fit items-center gap-2">
        <p class="font-black text-2xl">
            <span x-text="isBreak ? 'Break' : 'Focus'"></span>
            Session
        </p>

        <button
            class="cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950/25"
            @click="toggleSessionType()"
        >
            Switch
        </button>

        <span class="font-bold" x-text="`${pomodoroCount} / ${$store.countdownTimerSettings.sessionCountLimit}`"></span>
    </div>

    <div
        :class="[
            remainingTimeInSeconds <= 10 && !timerPaused ? 'animate-pulse' : '', remainingTimeInSeconds <= 10 ? 'text-red-500' : ''
        ]"
        class="mx-auto my-8 flex aspect-square w-fit max-w-full items-center justify-center rounded-full border-2 p-20 text-8xl font-bold"
        x-text="formatTime(remainingTimeInSeconds)"
    ></div>

    <div class="mx-auto flex w-fit gap-4">
        <x-button @click="startCountdown()" class="bg-neutral-500 text-white">
            Start
        </x-button>

        <x-button @click="pauseCountdown()" class="bg-neutral-500 text-white">
            Pause
        </x-button>

        <x-button
            @click="resetCountdownWithSound()"
            class="bg-neutral-500 text-white"
        >
            Reset
        </x-button>
    </div>
</div>

{{-- COUNTDOWN TIMER LOGIC --}}

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.store('countdownTimerSettings', {
            /*
            |-----------------------------------------------------------
            | Session Durations
            |-----------------------------------------------------------
            |
            | These control how long a session takes as well as how
            | many intervals there are between long and short breaks.
            |
            */

            sessionCountLimit: 4,
            focusDuration: 50,
            shortBreakDuration: 10,
            longBreakDuration: 30,
        });

        Alpine.data('countdownTimer', () => ({
            endTime: 0,
            interval: null,
            intervalStarted: false,
            isBreak: false,
            pomodoroCount: 0,
            remainingTimeInSeconds: 0,
            timerPaused: false,
            tickingSoundEffect: null,

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
                    return this.pomodoroCount < this.$store.coundownTimerSettings.sessionCountLimit
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
                this.tickingSoundEffect = new Audio(
                    '{{ Vite::asset("resources/assets/audio/sound-effects/ticking.mp3") }}',
                );

                this.remainingTimeInSeconds =
                    Number(localStorage.getItem('remainingTimeInSeconds')) ||
                    this.startTimeInSeconds;

                this.$watch('remainingTimeInSeconds', (value) => {
                    localStorage.setItem('remainingTimeInSeconds', value);
                });

                this.pomodoroCount =
                    Number(localStorage.getItem('pomodoroCount')) || 0;

                this.$watch('pomodoroCount', (value) => {
                    localStorage.setItem('pomodoroCount', value);
                });

                this.isBreak =
                    this.toBool(localStorage.getItem('isBreak')) || false;

                this.$watch('isBreak', (value) => {
                    localStorage.setItem('isBreak', value);
                });

                this.timerPaused =
                    this.toBool(localStorage.getItem('timerPaused')) || false;

                this.$watch('timerPaused', (value) => {
                    localStorage.setItem('timerPaused', value);
                });

                this.endTime = Number(localStorage.getItem('endTime')) || null;

                this.$watch('endTime', (value) => {
                    localStorage.setItem('endTime', value);
                });

                if (!this.timerPaused) this.startCountdown();
            },

            /*
            |---------------------------------
            | Timer Controls
            |---------------------------------
            |
            */

            startCountdown() {
                if (this.intervalStarted) return;

                this.playOnClickSound();

                // Calculate the end time based on the current time and remaining time
                // because browser throttling makes decrementing inaccurate.
                this.endTime = Date.now() + this.remainingTimeInSeconds * 1000;

                this.startInterval();
            },
            pauseCountdown() {
                if (!this.intervalStarted) return;

                this.timerPaused = true;

                this.playOffClickSound();
                this.stopTickingSound();

                this.removeInterval();
            },
            resetCountdown() {
                if (this.intervalStarted) {
                    this.stopTickingSound();
                    this.removeInterval();
                }

                this.timerPaused = false;
                this.remainingTimeInSeconds = this.startTimeInSeconds;
            },
            resetCountdownWithSound() {
                if (this.intervalStarted || this.timerPaused)
                    this.playResetTimerSoundEffect();

                this.resetCountdown();
            },

            /*
            |---------------------------------
            | Sound Methods
            |---------------------------------
            |
            */

            // TODO: Give the user the ability to choose the sound used
            // here. Each theme could have predefined sounds but there could be
            // a mixed theme that allows aspects from each theme.
            playBeepSound() {
                const beepSoundEffect = new Audio(
                    '{{ Vite::asset("resources/assets/audio/sound-effects/beep.mp3") }}',
                );
                beepSoundEffect.play();
            },
            playOnClickSound() {
                const onClickSoundEffect = new Audio(
                    '{{ Vite::asset("resources/assets/audio/sound-effects/on-click.mp3") }}',
                );
                onClickSoundEffect.play();
            },
            playOffClickSound() {
                const offClickSoundEffect = new Audio(
                    '{{ Vite::asset("resources/assets/audio/sound-effects/off-click.mp3") }}',
                );
                offClickSoundEffect.play();
            },
            playTickingSound() {
                this.tickingSoundEffect.play();
            },
            stopTickingSound() {
                this.tickingSoundEffect.pause();
                this.tickingSoundEffect.currentTime = 0;
            },
            playResetTimerSoundEffect() {
                const resetTimerSoundEffect = new Audio(
                    '{{ Vite::asset("resources/assets/audio/sound-effects/reset-timer.mp3") }}',
                );
                resetTimerSoundEffect.play();
            },

            /*
            |---------------------------------
            | Helper Methods
            |---------------------------------
            |
            */

            toBool(value) {
                return value === 'true';
            },

            startInterval() {
                this.timerPaused = false;
                this.intervalStarted = true;
                let tickingStarted = false;
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
                        if (!this.isBreak) this.pomodoroCount++;

                        if (this.pomodoroCount > 4) this.pomodoroCount = 0;

                        this.toggleSessionType();
                        this.playBeepSound();

                        // TODO: Send a notification or email that the timer ended
                        // TODO:Maybe make this user defined in the future

                        // I set the timeout to one second because the alert
                        // would block the sound from playing immediately.
                        return setTimeout(() => alert("Time's up!"), 1000);
                    }
                }, 1000);
            },
            removeInterval() {
                this.intervalStarted = false;
                clearInterval(this.interval);
            },
            formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            },
            toggleSessionType() {
                this.isBreak = !this.isBreak;
                this.resetCountdown();
            },

            /**
             * Converts minutes to seconds.
             *
             * @param {number} minutes - The minutes to be converted to seconds.
             * @returns {number} Seconds converted from minutes.
             */
            convertMinutesToSeconds(minutes)
            {
                return this.startTimeInMinutes * 60;
            }
        }));
    });
</script>
