<div
    x-data="countdownTimer"
    x-init="
        remainingTimeInSeconds = startTimeInSeconds;
    "
>
    <div
        :class="remainingTimeInSeconds <= 10 ? 'text-red-500 animate-pulse' : ''"
        class="text-8xl font-bold"
        x-text="formatTime(remainingTimeInSeconds)"
    ></div>

    <x-button
        class="my-8 bg-neutral-500 text-white"
        x-on:click="toggleSessionType()"
    >
        Toggle session type
    </x-button>

    {{-- TODO: Add a sound effect via JavaScript instead --}}
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

    <div class="flex gap-4">
        <x-button
            x-on:click="startCountdown()"
            class="bg-neutral-500 text-white"
        >
            Start
        </x-button>
        <x-button
            x-on:click="pauseCountdown()"
            class="bg-neutral-500 text-white"
        >
            Pause
        </x-button>
        <x-button
            x-on:click="resetCountdownWithSound()"
            class="bg-neutral-500 text-white"
        >
            Reset
        </x-button>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('countdownTimer', () => ({
            get startTimeInMinutes() {
                // TODO: Default or get them from user
                // BUG:It fails if there is a non perfect decimal or with more than two places
                if (this.isBreak) return 5;
                return 25;
            },
            get startTimeInSeconds() {
                return this.startTimeInMinutes * 60;
            },
            remainingTimeInSeconds: 0,
            interval: null,
            intervalStarted: false,
            timerPaused: false,
            isBreak: false, // TODO: Make this user definable in the future

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
                // because browser throttling makes the timer inaccurate.
                this.endTime = Date.now() + this.remainingTimeInSeconds * 1000;

                this.startInterval();
            },
            pauseCountdown() {
                if (!this.intervalStarted) return;

                this.timerPaused = true;

                this.playOffClickSound();
                this.pauseTickingSound();

                this.removeInterval();
            },
            resetCountdown() {
                if (this.intervalStarted) {
                    this.pauseTickingSound();
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

            playBeepSound() {
                this.$refs.beepSoundEffect.play();
            },
            playOnClickSound() {
                this.$refs.onClickSoundEffect.play();
            },
            playOffClickSound() {
                this.$refs.offClickSoundEffect.play();
            },
            stopTickingSound() {
                this.$refs.tickingSoundEffect.play();
            },
            pauseTickingSound() {
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

            startInterval() {
                this.intervalStarted = true;

                this.interval = setInterval(() => {
                    this.remainingTimeInSeconds = Math.max(
                        0,
                        Math.round((this.endTime - Date.now()) / 1000),
                    );

                    if (this.remainingTimeInSeconds <= 5) {
                        this.stopTickingSound();
                    }

                    if (this.remainingTimeInSeconds <= 0) {
                        this.toggleSessionType();
                        this.playBeepSound();
                        // TODO: Send a notification or email that the timer ended
                        // TODO:Maybe make this user defined in the future

                        // I set the timeout to 25ms because the alert
                        // would block the sound from playing immediately.
                        return setTimeout(() => alert("Time's up!"), 25);
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
