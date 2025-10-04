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

    <iframe
        allow="autoplay"
        class=""
        title="YouTube video player"
        :src="convertToEmbedUrl(playlist[chosenSongIndex].src)"
        referrerpolicy="strict-origin-when-cross-origin"
        x-ref="audio"
    ></iframe>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('musicPlaylist', () => ({
            init() {
                const storedIndex = localStorage.getItem('chosenSongIndex');

                if (storedIndex !== null && !isNaN(storedIndex)) {
                    this.chosenSongIndex = Number(storedIndex);
                }

                this.$watch('chosenSongIndex', (value) => {
                    localStorage.setItem('chosenSongIndex', value);
                    this.$refs.audio.load();
                    this.$refs.audio.play();
                });
            },
            chosenSongIndex: 0,
            playlist: [
                {
                    title: 'Calming White Noise',
                    src: 'https://www.youtube.com/watch?v=yLOM8R6lbzg&t=3599s',
                },
                {
                    title: '90s Chill Lofi Playlist',
                    src: 'https://www.youtube.com/watch?v=sF80I-TQiW0',
                },
                {
                    title: 'Lofi Hip Hop (Lofi Girl)',
                    src: 'https://www.youtube.com/watch?v=n61ULEU7CO0',
                },
            ],

            /*
             |---------------------------------
             | Helper Methods
             |---------------------------------
             |
             */

            convertToEmbedUrl(url) {
                const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
                return videoIdMatch
                    ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
                    : null;
            },
        }));
    });
</script>
