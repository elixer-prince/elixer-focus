<div x-data="countdownTimer">
    <div class="mx-auto flex w-fit items-center gap-2">
        <p class="font-black text-2xl">
            <span x-text="isBreak ? 'Break' : 'Focus'"></span>
            Session
        </p>

        <button
            class="cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950/25"
            @click="toggleSessionTypeWithConfirmation()"
        >
            Switch
        </button>

        <span
            class="font-bold"
            x-text="`${currentSessionCount} / ${$store.countdownTimerSettings.sessionCountLimit} &mdash; Total Focus Sessions: ${totalSessionsCompleted}`"
        ></span>
    </div>

    <div
        :class="[
            remainingTimeInSeconds <= 10 && !timerPaused ? 'animate-pulse' : '',
            remainingTimeInSeconds <= 10 ? 'text-red-500' : ''
        ]"
        class="mx-auto my-8 flex aspect-square w-fit max-w-full items-center justify-center rounded-full border-2 p-20 text-8xl font-bold"
        x-text="formatTime(remainingTimeInSeconds)"
    ></div>

    <div class="mx-auto flex w-fit gap-4">
        <x-button @click="startCountdownWithSound()" class="bg-neutral-500 text-white">
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

        <x-button
            @click="skipCountdown()"
            class="bg-neutral-500 text-white"
        >
            Skip
        </x-button>
    </div>
</div>
