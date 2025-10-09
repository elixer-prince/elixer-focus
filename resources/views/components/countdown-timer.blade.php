<div x-data="countdownTimer">
    <div class="mx-auto flex w-fit items-baseline gap-2">
        <p class="font-bold">
            Session type:
            <span x-text="isBreak ? 'Break' : 'Focus'"></span>
        </p>

        <button
            class="cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950/25"
            x-on:click="toggleSessionType()"
        >
            Switch
        </button>

        {{-- TODO: Make the 4 dynamic. --}}
        <span class="font-bold" x-text="`${pomodoroCount} / 4`"></span>
    </div>

    <div
        :class="[
            remainingTimeInSeconds <= 10 && !timerPaused ? 'animate-pulse' : '', remainingTimeInSeconds <= 10 ? 'text-red-500' : ''
        ]"
        class="mx-auto my-8 flex aspect-square w-fit max-w-full items-center justify-center rounded-full border-2 p-20 text-8xl font-bold"
        x-text="formatTime(remainingTimeInSeconds)"
    ></div>

    {{-- TODO: Add a sound effects via JavaScript instead --}}
    <audio
        x-ref="beepSoundEffect"
        src="{{ Vite::asset("resources/assets/audio/sound-effects/beep.mp3") }}"
    ></audio>

    <audio
        x-ref="onClickSoundEffect"
        src="{{ Vite::asset("resources/assets/audio/sound-effects/on-click.mp3") }}"
    ></audio>

    <audio
        x-ref="offClickSoundEffect"
        src="{{ Vite::asset("resources/assets/audio/sound-effects/off-click.mp3") }}"
    ></audio>

    <audio
        x-ref="tickingSoundEffect"
        src="{{ Vite::asset("resources/assets/audio/sound-effects/ticking.mp3") }}"
    ></audio>

    <audio
        x-ref="resetTimerSoundEffect"
        src="{{ Vite::asset("resources/assets/audio/sound-effects/reset-timer.mp3") }}"
    ></audio>

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

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.store('timerSettings', {
            pomodoroDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
        });
        Alpine.data('countdownTimer', () => ({
            endTime: 0,
            interval: null,
            intervalStarted: false,
            isBreak: false,
            pomodoroCount: 0,
            remainingTimeInSeconds: 0,
            timerPaused: false,

            init() {
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

            get startTimeInMinutes() {
                // BUG: It fails if there is a non perfect decimal or with more than two places
                if (this.isBreak)
                    return this.pomodoroCount < 4
                        ? this.$store.timerSettings.shortBreakDuration
                        : this.$store.timerSettings.longBreakDuration;

                return 25;
            },
            get startTimeInSeconds() {
                // Converts the start time in minutes to seconds
                return this.startTimeInMinutes * 60;
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
                this.$refs.beepSoundEffect.play();
            },
            playOnClickSound() {
                this.$refs.onClickSoundEffect.play();
            },
            playOffClickSound() {
                this.$refs.offClickSoundEffect.play();
            },
            playTickingSound() {
                this.$refs.tickingSoundEffect.play();
            },
            stopTickingSound() {
                this.$refs.tickingSoundEffect.pause();
                this.$refs.tickingSoundEffect.currentTime = 0;
            },
            playResetTimerSoundEffect() {
                this.$refs.resetTimerSoundEffect.play();
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
        }));
    });
</script>
