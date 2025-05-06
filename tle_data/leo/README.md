<!-- tle_data/leo/README.md -->
# Low Earth Orbit (LEO) TLE Data

This directory holds Two-Line Element (TLE) files for LEO satellites.

## Files
- Each file is named `<CATID>.tle` containing the two TLE lines.

## Updating
- Run from repo root:

```bash
python scripts/update_tle.py --orbit leo
```

Or rely on the scheduled GitHub Action to update automatically.

## Usage
- Parse with any SGP4 library:

```python
from sgp4.api import Satrec
lines = open('tle_data/leo/25544.tle').read().splitlines()
sat = Satrec.twoline2rv(lines[0], lines[1])
```
