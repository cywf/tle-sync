<!-- README.md -->
# tle-sync

**Automate the fetching, versioning, and (optionally) Notion-sync of TLE data** for Low Earth and Geostationary satellites.

## Features
- Fetches current TLEs for LEO & GEO lists on a 24 h cron  
- Version-controls all TLE files under `tle_data/`  
- **Optional** Notion integration: pushes TLE lines back into your Notion databases  

## Prerequisites
- Python 3.8+  
- A GitHub repo with Actions enabled

## Setup

1. **Clone & install deps**  
   ```bash
   git clone git@github.com:YOUR_ORG/tle-sync.git
   cd tle-sync
   pip install -r requirements.txt
   ```
2. **Configure CATIDs**
- Edit config/leo_cids.txt and config/geo_cids.txt with one NORAD CATID per line.

3. **(Optional) Notion integration**
- Create a Notion Internal Integration and share your LEO-DB & GEO-DB pages.
- Add the following secrets under Settings → Secrets:
```txt
NOTION_TOKEN
NOTION_LEO_DB_ID
NOTION_GEO_DB_ID
```

---

## Usage

### **Local test:**
```python
python scripts/update_tle.py
```

### **GitHub Actions:**
- Workflow is defined in .github/workflows/update-tle.yml.
- Runs daily at 04:00 UTC and on manual dispatch.

### **Extending**
- Swap in Space-Track API or other TLE sources.
- Integrate with downstream tools: orbit propagators, collision checkers, analytics…
