<div
    x-data="countdownTimer"
    x-init="
        startTimeInSeconds = startTimeInMinutes * 60;
        remainingTimeInSeconds = startTimeInSeconds;
    "
>
    <div
        :class="remainingTimeInSeconds <= 10 ? 'text-red-500' : ''"
        class="text-8xl font-bold"
        x-text="formatTime(remainingTimeInSeconds)"
    ></div>

    {{-- TODO: Add a sound effect via JavaScript instead --}}
    <audio
        x-ref="beepSoundEffect"
        src="{{ Vite::asset("resources/assets/audio/beep-sound-effect.mp3") }}"
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
            x-on:click="resetCountdown()"
            class="bg-neutral-500 text-white"
        >
            Reset
        </x-button>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('countdownTimer', () => ({
            // Default or get from user
            // BUG:It fails if there is a non perfect decimal or with more than two places
            startTimeInMinutes: 0.25,
            startTimeInSeconds: 0,
            remainingTimeInSeconds: 0,
            interval: null,
            intervalStarted: false,

            /*
             |---------------------------------
             | Timer Controls
             |---------------------------------
             |
             */

            startCountdown() {
                if (this.intervalStarted) return;

                this.intervalStarted = true;
                this.interval = setInterval(() => {
                    if (this.remainingTimeInSeconds <= 0) {
                        this.resetCountdown();
                        this.removeInterval();
                        // TODO: Send a notification or email that the timer ended
                        // TODO:Maybe make this user defined in the future
                        alert("Time's up!");
                        return;
                    }

                    this.remainingTimeInSeconds--;
                }, 1000);
            },
            pauseCountdown() {
                if (!this.intervalStarted) return;

                this.removeInterval();
            },
            resetCountdown() {
                this.$refs.beepSoundEffect.play();
                this.remainingTimeInSeconds = this.startTimeInSeconds;
            },

            /*
             |---------------------------------
             | Helper Methods
             |---------------------------------
             |
             */

            removeInterval() {
                this.intervalStarted = false;
                clearInterval(this.interval);
            },
            formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            },
        }));
    });
</script>
