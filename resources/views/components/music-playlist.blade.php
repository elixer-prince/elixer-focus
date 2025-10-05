<div x-data="musicPlaylist">
    <template x-for="(song, index) in playlist" :key="index">
        <label>
            <input type="radio" :value="index" x-model="chosenSongIndex" />
            <span x-text="song.title"></span>
        </label>
    </template>

    <div class="" id="player"></div>
</div>

<script src="https://www.youtube.com/iframe_api"></script>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('musicPlaylist', () => ({
            player: null,
            chosenSongIndex: 0,
            playlist: [
                {
                    title: 'Calming White Noise',
                    src: 'https://www.youtube.com/watch?v=yLOM8R6lbzg',
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

            init() {
                const storedIndex = localStorage.getItem('chosenSongIndex');

                if (storedIndex !== null && !isNaN(storedIndex))
                    this.chosenSongIndex = Number(storedIndex);

                this.$watch('chosenSongIndex', (value) => {
                    localStorage.setItem('chosenSongIndex', value);
                    if (this.player) {
                        const videoId = this.extractVideoId(
                            this.playlist[value].src,
                        );
                        this.player.loadVideoById(videoId);
                    }
                });

                // Create player if the Iframe API is already loaded
                if (window.YT && YT.Player) {
                    this.createPlayer();
                }
            },

            createPlayer() {
                const videoId = this.extractVideoId(
                    this.playlist[this.chosenSongIndex].src,
                );
                this.player = new YT.Player('player', {
                    videoId: videoId,
                    playerVars: { autoplay: 1, playsinline: 1 },
                    events: {
                        onReady: (event) => event.target.playVideo(),
                    },
                });
            },

            extractVideoId(url) {
                const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
                return match ? match[1] : null;
            },
        }));
    });

    function onYouTubeIframeAPIReady() {
        document
            .querySelector('[x-data="musicPlaylist"]')
            .__x.$data.createPlayer();
    }
</script>
