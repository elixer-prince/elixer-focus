<div x-data="timerSettings" class="mb-8">
    <div class="font-bold">Timer Settings</div>

    <div class="flex items-end gap-4">
        <div class="flex flex-col">
            <label for="focus-duration">Focus Duration</label>
            <input
                id="focus-duration"
                @keydown.enter="saveChanges()"
                x-ref="focusInput"
                type="number"
                class="rounded-md border-2 px-2 py-1 font-bold"
                placeholder="Focus Duration"
                :value="$store.countdownTimerSettings.focusDuration"
            />
        </div>

        <div class="flex flex-col">
            <label for="short-break">Short Break</label>
            <input
                id="short-break"
                @keydown.enter="saveChanges()"
                x-ref="shortBreakInput"
                class="rounded-md border-2 px-2 py-1 font-bold"
                type="number"
                placeholder="Short break"
                :value="$store.countdownTimerSettings.shortBreakDuration"
            />
        </div>

        <div class="flex flex-col">
            <label for="long-break">Long Break</label>
            <input
                id="long-break"
                x-ref="longBreakInput"
                @keydown.enter="saveChanges()"
                class="rounded-md border-2 px-2 py-1 font-bold"
                type="number"
                placeholder="Long break"
                :value="$store.countdownTimerSettings.longBreakDuration"
            />
        </div>

        <x-button @click="saveChanges()" class="bg-neutral-500 text-white">
            Save Changes
        </x-button>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('timerSettings', () => ({
            saveChanges() {
                this.$store.countdownTimerSettings.focusDuration =
                    this.$refs.focusInput.value;
                localStorage.setItem(
                    'focusDuration',
                    JSON.stringify(this.$refs.focusInput.value),
                );
                this.$store.countdownTimerSettings.shortBreakDuration =
                    this.$refs.shortBreakInput.value;
                localStorage.setItem(
                    'shortBreakDuration',
                    JSON.stringify(this.$refs.shortBreakInput.value),
                );
                this.$store.countdownTimerSettings.longBreakDuration =
                    this.$refs.longBreakInput.value;
                localStorage.setItem(
                    'longBreakDuration',
                    JSON.stringify(this.$refs.longBreakInput.value),
                );

                alert('Timer Settings saved');
            },
        }));
    });
</script>
