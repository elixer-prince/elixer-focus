<div x-data="musicPlaylist">
    <div class="mb-2">
        <p class="font-bold">Choose a song</p>

        <template x-for="(song, index) in playlist" :key="index">
            <label class="block">
                <input type="radio" :value="index" x-model="chosenSongIndex" />
                <span x-text="song.title"></span>

                <template x-if="song.isRecommended">
                    <span class="border-2 text-neutral-500 font-bold text-xs rounded-full px-2 py-1">Recommended</span>
                </template>
            </label>
        </template>
    </div>

    <div class="rounded-xl mb-8" id="player"></div>
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
                    isRecommended: true,
                },
                {
                    title: '90s Chill Lofi Playlist',
                    src: 'https://www.youtube.com/watch?v=sF80I-TQiW0',
                    isRecommended: false,
                },
                {
                    title: 'Lofi Hip Hop (Lofi Girl)',
                    src: 'https://www.youtube.com/watch?v=n61ULEU7CO0',
                    isRecommended: false,
                },
                {
                    title: 'Chillstep Music for Programming / Cyber / Coding',
                    src: 'https://www.youtube.com/watch?v=M5QY2_8704o',
                    isRecommended: false,
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

                // If the API is already loaded, create the player
                if (window.YT && YT.Player) return this.createPlayer();

                // Wait for global callback
                window._createPlayerAfterAPI = () => this.createPlayer();
            },

            createPlayer() {
                const videoId = this.extractVideoId(this.playlist[this.chosenSongIndex].src);
                this.player = new YT.Player('player', {
                    videoId: videoId,
                    host: 'https://www.youtube-nocookie.com',
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
        if (window._createPlayerAfterAPI) {
            window._createPlayerAfterAPI();
        }
    }
</script>
