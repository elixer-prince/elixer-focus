<div x-data="musicPlaylist">
    <div class="font-bold" x-text="playlist[0].title"></div>

    <audio :src="playlist[0].src" controls loop>
        <p>Your browser does not support the audio element.</p>
    </audio>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('musicPlaylist', () => ({
            playlist: [
                {
                    title: 'Calming White Noise',
                    src: '{{ Vite::asset("resources/assets/music/white-noise-for-studying.mp3") }}',
                },
                {
                    title: '90s Chill Lofi Playlist',
                    src: '{{ Vite::asset("resources/assets/music/90s-chill-lofi-playlist-japanese-town.mp3") }}',
                },
                {
                    title: 'lofi hip hop mix 📚 beats to relax/study to (Part 1)',
                    src: '{{ Vite::asset("resources/assets/music/lofi-girl-playlist.mp3") }}',
                },
            ],
        }));
    });
</script>
