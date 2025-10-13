document.addEventListener("alpine:init", () => {
   Alpine.store("utilityFunctions", {
       /**
        * Plays the specified sound.
        *
        * This method takes the URL path of a sound and plays it from
        * the beginning.
        *
        * @param effect - The sound effect to be played.
        */
       playSound(effect) {
           effect.currentTime = 0;
           effect.play();
       },

       /**
        * Stops the specified sound.
        *
        * This functions pauses the specified sound effect and reset the
        * current time to zero to simulate stopping.
        *
        * @param effect - The sound effect to be stopped.
        */
       stopSound(effect) {
           effect.pause();
           effect.currentTime = 0;
       },
   });
});
