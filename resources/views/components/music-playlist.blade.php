<div x-data="musicPlaylist">
    <div class="my-4 flex gap-4">
        <template x-for="song in playlist">
            <label :key="playlist.indexOf(song)">
                <input
                    type="radio"
                    :value="playlist.indexOf(song)"
                    x-model="chosenSongIndex"
                />

                <span class="font-bold" x-text="song.title"></span>
            </label>
        </template>
    </div>

    <div class="font-bold" x-text="playlist[chosenSongIndex].title"></div>

    <audio x-ref="audio" :src="playlist[chosenSongIndex].src" controls loop>
        <p>Your browser does not support the audio element.</p>
    </audio>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('musicPlaylist', () => ({
            chosenSongIndex: 0,
            init() {
                this.$watch('chosenSongIndex', () => {
                    this.$refs.audio.load();
                    this.$refs.audio.play();
                });
            },
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
                    title: 'Lofi Hip Hop (Lofi Girl)',
                    src: '{{ Vite::asset("resources/assets/music/lofi-girl-playlist.mp3") }}',
                },
            ],
        }));
    });
</script>
