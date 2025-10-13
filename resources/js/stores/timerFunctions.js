document.addEventListener("alpine:init", () => {
   Alpine.store("timerFunctions", {
       /**
        * Converts minutes to seconds.
        *
        * @param {number} minutes - The minutes to be converted to seconds.
        * @returns {number} Seconds converted from minutes.
        */
       convertMinutesToSeconds(minutes) {
           return minutes * 60;
       },

       /**
        * Formats the seconds provided to a human-readable string value.
        *
        * @param {number} seconds - The seconds to be formatted.
        * @returns {string} The seconds formatted as a string.
        */
       formatTimeInMinutesAndSeconds(seconds) {
           const minutes = Math.floor(seconds / 60);
           const secondsRemainder = seconds % 60;
           return `${minutes.toString().padStart(2, '0')}:${secondsRemainder.toString().padStart(2, '0')}`;
       },
   });
});
