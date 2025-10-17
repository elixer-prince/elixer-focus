document.addEventListener("alpine:init", () => {
    Alpine.store("utility", {
        playSound(effect) {
            effect.currentTime = 0;
            effect.play();
        },

        stopSound(effect) {
            effect.pause();
            effect.currentTime = 0;
        },
    });
});
