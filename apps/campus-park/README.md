# ParkCampus — University Parking App

A campus parking concept that pairs a mobile app with parking-space sensors. Research with Stanford students and faculty informed the core interface and user flows. This is an interactive version of the Figma mockup.

What you can do in the phone:

- **Lots**: search, filter to lots your permit allows, sort by nearest or most open. Spaces remaining update live.
- **Map**: lots colored by availability (open / almost full / full). Tap one for its detail sheet, with every space's sensor shown.
- **Navigate**: guides you to the closest open space and moves you to the next one if someone takes it. If the lot fills before you arrive, it offers a reroute.
- **Profile**: switch between Stanford's permit types (A, C, MC, resident EA/ES/EVF/SJ/SO/WE, visitor), with who's eligible, where it's valid and 2026 prices. Also favorites and a timer for where you parked.

## Permit rules

From Stanford Transportation's [permit FAQ](https://transportation.stanford.edu/parking-stanford/purchase-parking/frequently-asked-questions-faqs-parking-permits), [resident parking](https://transportation.stanford.edu/parking-stanford/purchase-parking/student-parking/resident-student-parking) and [enforcement](https://transportation.stanford.edu/parking-stanford/parking-enforcement-and-citations/parking-enforcement) pages, implemented in `canPark` / `enforced` in `src/data.ts`:

- 'A' parks in A, C and shared residential spaces; 'C' in C and shared residential spaces. (Both also cover motorcycle spaces, which the app skips because it guides a car.)
- Residential permits are valid only in their own zone, except EVF, which also covers ES. Residential spaces are enforced 24/7.
- A/C rules apply weekdays 6 AM–4 PM (the Oval until 6 PM); visitor 'P' spaces weekdays 8 AM–4 PM via ParkMobile. Outside those hours anyone can park there.
- Demand curves follow the FAQ's note that C spaces fill by mid-morning.

The panel beside the phone drives the simulation: a time-of-day slider and weekday/weekend toggle change both demand (`targetOccupancy` in `src/data.ts`) and which rules are in force, "Fill my destination" demos the reroute, and the sensor feed shows each space changing (`src/sensors.ts`).

Lot names are Stanford's and placed in roughly the right part of campus, but the map is schematic. The mix of zones in each lot and all capacities are estimates, and occupancy is simulated.

```bash
npm install
npm run dev
npm run build
```
