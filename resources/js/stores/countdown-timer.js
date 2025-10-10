document.addEventListener("alpine:init", () => {
    Alpine.store('countdownTimerSettings', {
        /*
        |-----------------------------------------------------------
        | Session Durations
        |-----------------------------------------------------------
        |
        | These control how long a session takes as well as how
        | many intervals there are between long and short breaks.
        |
        */

        sessionCountLimit: 4,
        focusDuration: 50,
        shortBreakDuration: 10,
        longBreakDuration: 30,
    });
});
