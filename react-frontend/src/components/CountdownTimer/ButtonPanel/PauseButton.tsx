// function pauseTimer() {
//     if (timerPaused) return;

//     playSound(offClickSoundEffect);
//     clearInterval(timerInterval);
//     setTimerPaused(true);
// }

const PauseButton = () => {
    return <button className="btn">Pause</button>;
};

export default PauseButton;
