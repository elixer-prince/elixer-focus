// function resetTimer() {
//     if (!timerRunning) return;

//     playSound(resetTimerSoundEffect);
//     clearInterval(timerInterval);
//     setTimerRunning(false);
//     saveToLocalStorage("timerRunning", false);
//     setTimerPaused(true);
//     saveToLocalStorage("timerPaused", true);

//     const newRemainingTime = convertMinutesToSeconds(startTimeInMinutes);

//     setRemainingTimeInSeconds(newRemainingTime);
//     saveToLocalStorage("remainingTimeInSeconds", newRemainingTime);
// }

const ResetButton = () => {
    return <button className="btn">Reset</button>;
};

export default ResetButton;
