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
                    title: '90s Chill Lofi Playlist',
                    src: '{{ Vite::asset("resources/assets/music/90s-chill-lofi-playlist-japanese-town.mp3") }}',
                },
            ],
        }));
    });
</script>
