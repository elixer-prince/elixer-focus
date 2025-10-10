<div class="mb-8">
    <div class="font-bold">Timer Settings</div>

    <div x-data class="flex items-end gap-4">
        <div class="flex flex-col">
            <label for="focus-duration">Focus Duration</label>
            <input
                id="focus-duration"
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
                class="rounded-md border-2 px-2 py-1 font-bold"
                type="number"
                placeholder="Long break"
                :value="$store.countdownTimerSettings.longBreakDuration"
            />
        </div>

        <x-button class="bg-neutral-500 text-white">Save Changes</x-button>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {});
</script>
