# Mobile Accessibility and Cross-Network WebRTC QA

This checklist covers the acceptance work that requires real devices or
cross-network endpoints. Run it after the Railway service is live and
GitHub Pages is serving the latest main build.

## Prerequisites

- Latest `main` is deployed to `https://piprot.github.io/quanbian-zhilu/`.
- Railway service is healthy at $railwayHttps.
- At least two devices are available:
  - iOS device with VoiceOver enabled.
  - Android device with TalkBack enabled.
  - One device on Wi-Fi and one on cellular/mobile data for cross-network WebRTC.

## Automated Gates

Run these before starting manual device QA:

```bash
npm run build
npm run deploy:check
npm run test:server
npm run test:rtc
npm run test:rtc:public
npm run test:live
```

`npm run test:live` only passes after Render is deployed. `npm run
test:rtc:public` verifies the public frontend with desktop/mobile browser
contexts on this machine; it does not replace a real cross-network device test.

## VoiceOver QA (iOS)

1. Open the public app in Safari.
2. Enable VoiceOver, then restart the page.
3. Confirm the app title, language toggle, sound toggle, menu buttons, and
   role/profile actions are announced with useful labels.
4. Create a profile using swipe navigation only; every control must be
   reachable and readable without visual inspection.
5. Enter the campaign, choose options, and reach at least one random event and
   one side quest node.
6. Open the report, abilities, achievements, relations, and leaderboard views;
   confirm each heading and button is announced in the selected language.
7. Start an AI duel and verify round timer, interference, options, and result
   state are announced or reachable.

## TalkBack QA (Android)

Repeat the VoiceOver checks on Android with TalkBack. In addition:

1. Confirm touch targets remain tappable at the system default font scale.
2. Set font scale to 1.5 and verify no critical text is clipped or overlapping.
3. Confirm focus order follows the visual layout for menu, profile, map, story,
   report, ability, and duel screens.
4. Verify the 1v1 lobby supports TalkBack navigation for remote and cloud match
   controls.

## Cross-Network WebRTC QA

1. Open the public app on device A (Wi-Fi) and device B (cellular/mobile data).
2. Create or load a profile on both devices.
3. On device A, open 1v1 -> Remote and generate an invite.
4. On device B, open 1v1 -> Remote and paste the invite code.
5. Copy the answer code back to device A and complete the connection.
6. Confirm both devices reach the first duel round and can exchange picks.
7. Record the invite/answer sizes, connect latency, and any WebRTC error text.
8. Repeat with device roles reversed.

## Cloud Match QA

1. Open the public app on two devices after the Render service is live.
2. Open 1v1 -> Cloud Auto-Match on both devices.
3. Confirm both devices receive a match start and can send picks to each other.
4. Confirm the leaderboard shows signed scores and no duplicate account entries
   appear after reloading.

## Acceptance Record

Fill the table after manual testing:

| Item | Pass | Notes |
| --- | --- | --- |
| iOS VoiceOver profile/campaign/report |  |  |
| Android TalkBack profile/campaign/report |  |  |
| Font scale 1.5 no clipping |  |  |
| Cross-network WebRTC both directions |  |  |
| Cloud match relay |  |  |
| Cloud save reload |  |  |
| Signed leaderboard |  |  |

