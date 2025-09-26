<x-layouts.app>
    <x-slot name="pageTitle">Welcome to Elixer Focus</x-slot>
    <x-slot name="pageDescription">Welcome to Elixer Focus</x-slot>

    <header>
        <h1 class="font-bold">Elixer Focus</h1>
    </header>

    <div
        x-data="{ startTimeInSeconds: 25, time: 0 }"
        x-init="time = startTimeInSeconds"
    >
        <div
            :class="time <= 10 ? 'text-red-500' : ''"
            class="text-8xl font-bold"
            x-text="time"
        ></div>

        <div class="flex gap-4">
            <x-button x-on:click="time--" class="bg-neutral-500 text-white">
                Start
            </x-button>
            <x-button
                x-on:click="alert('pause clicked')"
                class="bg-neutral-500 text-white"
            >
                Pause
            </x-button>
            <x-button
                x-on:click="time = startTimeInSeconds"
                class="bg-neutral-500 text-white"
            >
                Reset
            </x-button>
        </div>
    </div>

    <div>
        <div class="font-bold">90s Chill Lofi Playlist</div>

        <audio controls loop>
            <source
                src="{{ Vite::asset("resources/assets/music/90s-chill-lofi-playlist-japanese-town.mp3") }}"
                type="audio/mpeg"
            />

            <p>Your browser does not support the audio element.</p>
        </audio>
    </div>

    <div>
        <div class="font-bold">
            lofi hip hop mix 📚 beats to relax/study to (Part 1)
        </div>

        <audio controls loop>
            <source
                src="{{ Vite::asset("resources/assets/music/lofi-girl-playlist.mp3") }}"
                type="audio/mpeg"
            />

            <p>Your browser does not support the audio element.</p>
        </audio>
    </div>
</x-layouts.app>
