# Verify: Sleep Schedule · spec 0008 · updated 2026-11-26

_Manual checks derived from spec 0008 acceptance criteria._

## UI / manual

- [ ] Start with a new browser profile. Confirm the wake time and bedtime override are unset and the target shows 8 hours. This checks AC-1 and the initial values.
- [ ] Save target values of 1, 1.25, and 16 hours. Confirm they persist as 60, 75, and 960 minutes. Try values outside the range and values that do not use quarter hour steps, and confirm they are rejected. This checks AC-1.
- [ ] Set a 07:00 wake time with an 8 hour target. Confirm the planned bedtime preview shows 23:00. Change the unsaved wake time and target, and confirm the preview updates before saving. Repeat around a daylight saving gap and repeated hour. This checks AC-2 and planned time sources.
- [ ] Set an override later than wake, then earlier than or equal to wake. Confirm the first valid occurrence is used, the duration difference is shown, and reset returns to automatic. This checks AC-2 and the override warning source.
- [ ] Clear the wake time, then load malformed saved schedule values. Confirm there are no planned events or rail, totals are unavailable, and the repair message appears without replacing actual records. This checks AC-3.
- [ ] Change the browser time zone. Confirm planned dates and clock labels recalculate, actual timestamps display in the new zone, and the saved sleep date remains the original bedtime date. This checks AC-2 and AC-5.
- [ ] In Day, Multi Day, and Week, confirm planned Wake Up and Go to Bed events come from schedule settings and actual events appear only when their timestamps fall on a visible local date. This checks AC-4 and AC-5.
- [ ] Confirm rail segments fill before and through now, remain empty later, continue across local midnight, and do not move when actual records change. This checks AC-4.
- [ ] In Month, confirm compact sleep markers appear without a rail or awake total. This checks AC-4 and AC-6.
- [ ] In a time grid view on today, confirm the horizontal current time line and NOW label appear separately from the awake rail. This checks AC-4.
- [ ] Record bedtime today and confirm its timestamp is current time. Add and correct a past bedtime using local time, reject future timestamps, record a wake for the most recent earlier incomplete bedtime, and confirm missing or invalid wake actions explain why. Clear wake, then clear bedtime with a recorded wake and confirm the whole night is removed only after confirmation. This checks AC-5.
- [ ] Confirm actual sleep duration is derived from the timestamps and shown on the wake date. This checks AC-5.
- [ ] Add idle intervals inside and outside planned awake windows, including an open interval and a midnight crossing. Confirm per date totals include only intersections through now, round down remaining seconds, and do not modify intervals or sessions. Confirm totals are unavailable without a valid plan and hidden in Month. This checks AC-3 and AC-6.
- [ ] Import paired beds and wakes, bed only entries, unmatched wakes, invalid values, and duplicate dates. Review reasons and raw values, export JSON, delete recovery data, and retry migration without duplicates. Confirm Calendar source clears only after Sleep Schedule persists. This checks AC-7 and AC-8.
- [ ] Change settings from another tab, disable Web Locks or BroadcastChannel, and force a local write failure. Confirm serialized writes, single tab fallback, no saved confirmation on failure, and a visible error toast. This checks AC-7.
- [ ] Use the feature while observing network requests. Confirm no server or external calendar request occurs and sessions during planned sleep remain unchanged. This checks AC-9.

## Acceptance-criteria coverage

- AC-1: steps 1 and 2 cover initial settings, the displayed hours, stored minutes, and validation.
- AC-2: steps 3, 4, and 6 cover planned time derivation, overrides, daylight saving behavior, and time zone changes.
- AC-3: steps 5 and 13 cover invalid schedules and unavailable totals.
- AC-4: steps 7 through 10 cover planned events, the rail, Month markers, and the independent current time line.
- AC-5: steps 6, 7, 11, and 12 cover actual timestamps, records, and derived duration.
- AC-6: step 13 covers awake totals from idle intervals.
- AC-7: steps 14 and 15 cover persistence, migration, coordination, fallback, and write failures.
- AC-8: step 14 covers recovery review, export, deletion, and safe retries.
- AC-9: step 16 covers local data and unchanged session history.