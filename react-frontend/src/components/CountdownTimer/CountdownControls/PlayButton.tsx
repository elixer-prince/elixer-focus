// function startTimer() {
//     if (!timerPaused) return;

//     playSound(onClickSoundEffect);

//     const newEndTime = calculateEndTime(remainingTimeInSeconds);

//     setEndTime(newEndTime);
//     saveToLocalStorage("endTime", newEndTime);

//     setTimerRunning(true);
//     setTimerPaused(false);

//     const interval = setInterval(() => {
//         setRemainingTimeInSeconds((currentRemainingTime: number) => {
//             if (currentRemainingTime === 0) {
//                 clearInterval(interval);
//                 setTimerRunning(false);
//                 setTimerPaused(true);
//                 return 0;
//             }

//             const newSeconds = Math.max(
//                 0,
//                 Math.round((newEndTime - Date.now()) / 1000),
//             );

//             saveToLocalStorage("remainingTimeInSeconds", newSeconds);

//             if (newSeconds <= 5) playSound(tickingSoundEffect);

//             if (newSeconds === 0) {
//                 stopSound(tickingSoundEffect);
//                 playSound(beepSoundEffect);
//                 clearInterval(interval);
//                 setTimerRunning(false);
//                 setTimerPaused(true);
//                 handleSessionTypeSwitch();
//                 setTimeout(() => alert("The timer has ended!"), 1000);
//             }

//             return newSeconds;
//         });
//     }, 1000);

//     setTimerInterval(interval);
// }

const PlayButton = () => {
    return <button className="btn">Play</button>;
};

export default PlayButton;
