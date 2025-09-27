<x-layouts.app>
    <x-slot name="pageTitle">Welcome to Elixer Focus</x-slot>
    <x-slot name="pageDescription">Welcome to Elixer Focus</x-slot>

    <header>
        <h1 class="font-bold">Elixer Focus</h1>
    </header>

    <x-countdown-timer />

    <div>
        <div class="font-bold">White Noise To Calm My Mind</div>

        <audio controls loop>
            <source
                src="{{ Vite::asset("resources/assets/music/white-noise-for-studying.mp3") }}"
                type="audio/mpeg"
            />

            <p>Your browser does not support the audio element.</p>
        </audio>
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
