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
        focusDuration:
            JSON.parse(localStorage.getItem('focusDuration')) || 50,
        shortBreakDuration:
            JSON.parse(localStorage.getItem('shortBreakDuration')) || 10,
        longBreakDuration:
            JSON.parse(localStorage.getItem('longBreakDuration')) || 30,
    });
});
