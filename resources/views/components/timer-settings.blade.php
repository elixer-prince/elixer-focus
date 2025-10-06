<div class="mb-8">
    <div class="font-bold">Timer Settings</div>

    <div x-data class="flex items-end gap-4">
        <div class="flex flex-col">
            <label for="pomodoro-duration">Focus Duration</label>
            <input
                id="pomodoro-duration"
                type="text"
                class="rounded-md border-2 px-2 py-1 font-bold"
                placeholder="Pomodoro Duration"
                :value="$store.timerSettings.pomodoroDuration"
            />
        </div>
        <div class="flex flex-col">
            <label for="short-break">Short Break</label>
            <input
                id="short-break"
                class="rounded-md border-2 px-2 py-1 font-bold"
                type="text"
                placeholder="Short break"
                :value="$store.timerSettings.shortBreakDuration"
            />
        </div>
        <div class="flex flex-col">
            <label for="long-break">Long Break</label>
            <input
                id="long-break"
                class="rounded-md border-2 px-2 py-1 font-bold"
                type="text"
                placeholder="Long break"
                :value="$store.timerSettings.longBreakDuration"
            />
        </div>

        <x-button class="bg-neutral-500 text-white">Save Changes</x-button>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {});
</script>
