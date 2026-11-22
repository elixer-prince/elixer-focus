import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import { useEffect, useRef } from "react";

/**
 * Prevents the browser from throttling the tab while the timer is running.
 *
 * Modern browsers throttle setInterval in background tabs and power saving
 * modes to save battery. However, they do not throttle tabs that are playing
 * audio. This hook creates a Web Audio API oscillator that plays a nearly
 * silent tone (0.001 volume) while the timer is active. The tone is inaudible
 * to humans but counts as audio playback to the browser, keeping the tab
 * exempt from throttling.
 *
 * This allows the timer interval to fire normally even when the tab is in
 * the background, so the end beep plays automatically and the timer state
 * remains accurate.
 */
const usePreventTabThrottling = () => {
  const timerRunning = useTimerRunning();

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    // Create the audio context and oscillator chain
    // webkitAudioContext is the legacy Safari prefix; cast to AudioContext for type safety
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    // Set the volume to nearly silent (0.001 = -60dB)
    // This is inaudible to humans but counts as audio to the browser
    gainNode.gain.value = 0.001;

    // Use a low frequency that is less likely to be audible
    oscillator.frequency.value = 220;

    // Connect the chain: oscillator -> gain -> destination
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Start the oscillator
    oscillator.start();

    // Store references for cleanup
    audioContextRef.current = context;
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    // When the tab becomes visible again, resume the audio context if it was
    // suspended by the browser while the tab was backgrounded. This prevents
    // the ticking sound from stopping and restarting when switching virtual
    // desktops, and ensures the end beep plays without delay.
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && audioContextRef.current) {
        const ctx = audioContextRef.current;
        if (ctx.state === "suspended") {
          try {
            await ctx.resume();
          } catch {
            // Resume may fail if the context is already closed
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Stop and clean up when timer stops or component unmounts
      try {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
        context.close();
      } catch {
        // Ignore errors if already stopped
      }

      audioContextRef.current = null;
      oscillatorRef.current = null;
      gainNodeRef.current = null;
    };
  }, [timerRunning]);
};

export default usePreventTabThrottling;
