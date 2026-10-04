# CampusPark — University Campus Parking App

A campus parking concept that pairs a mobile app with parking-space sensors. Research with Stanford students and faculty informed the core interface and user flows. This is an interactive version of the Figma mockup.

What you can do in the phone:

- **Lots**: search, filter to lots your permit allows, sort by nearest or most open. Spaces remaining update live.
- **Map**: lots colored by availability (open / almost full / full). Tap one for its detail sheet, with every space's sensor shown.
- **Navigate**: guides you to the closest open space and moves you to the next one if someone takes it. If the lot fills before you arrive, it offers a reroute.
- **Profile**: switch permit (A, C, EA, ES, V), see favorites, and a timer for where you parked.

The panel beside the phone drives the simulation: a time-of-day slider changes demand (`targetOccupancy` in `src/data.ts`), "Fill my destination" demos the reroute, and the sensor feed shows each space changing (`src/sensors.ts`).

Lot names and addresses are Stanford's; the map is schematic and all occupancy is simulated.

```bash
npm install
npm run dev
npm run build
```
