<!-- tle_data/geo/README.md -->
# Geostationary Orbit (GEO) TLE Data

This directory holds Two-Line Element (TLE) files for GEO satellites.

## Files
- Each file is named `<CATID>.tle` containing the two TLE lines.

## Updating
- Run from repo root:

```bash
python scripts/update_tle.py --orbit geo
```

- Or rely on the scheduled GitHub Action to update automatically.

## Usage
- Load into your favorite orbit library to compute station-keeping, drift, etc.
