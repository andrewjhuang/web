# I Scream Room — a playable mini game

A space for early-stage founders to release pressure and connect with their experiences. Interviews and on-site prototype testing at StartX and Stanford Research Park (2025) shaped a soundproof room and an accompanying scream kit. This app turns that physical prototype into a short, video-game-style simulation.

**How it plays**
1. **Lobby (sensory overload).** Notifications pile up at your StartX desk and your stress climbs, until the storefront sign appears: “I scream, you scream, we all scream.”
2. **The room.** Point and click:
   - **Scream**: hold the button or the space bar, or use your real voice (mic loudness is measured locally and never leaves the page). The screen shakes and you get a dB reading. Screaming with the door unlocked gives half the relief, a nod to the “I don’t feel safe enough to scream” feedback.
   - **Lock the door** (privacy), **pop balloons** with faces drawn on them, **kick the soccer ball** off the walls, and **read and write anonymous sticky notes**.
   - **The neon sign** cycles the wall finish: *Research Park* (sandstone, eucalyptus sage, terracotta), *Golden hour*, and the *Original prototype* blue moving blankets for comparison.
   - **Walls** use newer acoustic treatments instead of blankets: a wooden quadratic-residue diffuser, recycled-PET felt fins, 3D wave panels and hanging acoustic clouds.
3. **Exit.** Before/after stress bins (like the booth’s BEFORE/AFTER trays) and what you did.

**Behind the design** opens the case study: need, POV, the Box/Room/Booth prototypes and the motivation each tested, feedback → design changes, golden moments and the final room, with photos from the team’s deck.

Sounds are synthesized with Web Audio (no audio files). Notes are paraphrased from interviews. Not affiliated with StartX or Stanford Research Park.

To embed with the microphone option, allow it on the iframe: `<iframe src="…/?embed" allow="microphone">`.

```bash
npm install
npm run dev
npm run build
```
