<!-- README.md -->
# tle-sync

**Automate the fetching, versioning, and (optionally) Notion-sync of TLE data** for Low Earth and Geostationary satellites.

## 🌐 Live Documentation Site

**Visit:** [https://cywf.github.io/tle-sync/](https://cywf.github.io/tle-sync/)

Explore the interactive documentation site featuring:
- **Data Explorer**: Browse and download TLE files with filters
- **Statistics**: Repository insights and commit activity
- **Development Board**: Track issues and project progress
- **Documentation**: Comprehensive guides and API docs
- **Visualizer**: Interactive project diagrams

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

---

## 📊 Documentation Site

The documentation site is built with Astro + React + TailwindCSS + daisyUI and deployed to GitHub Pages.

### Site Routes

- `/` - Home page with project overview
- `/data-explorer` - Browse and download TLE files
- `/statistics` - Repository statistics and insights
- `/discussions` - Community discussions
- `/development-board` - Project board and issue tracking
- `/create-issue` - Quick issue creation
- `/docs` - Documentation viewer
- `/visualizer` - Project diagrams

### TLE Catalog Generation

The Data Explorer uses a catalog generated at build time by `site/scripts/index_tle.ts`:

1. Scans all files in `tle_data/`
2. Parses TLE lines and extracts epoch data
3. Determines orbit type (LEO/GEO) from directory structure
4. Generates `site/public/data/tle_catalog.json` for the frontend

**Security Note**: All data generation happens at build time using `GITHUB_TOKEN` in CI. No secrets are exposed to the client. The site is 100% static with no server component.

### Building Locally

```bash
cd site
npm install
npm run dev
```

### Automated Deployment

The `.github/workflows/pages.yml` workflow:
1. Copies `tle_data/` to `site/public/tle/`
2. Generates JSON snapshots (stats, discussions, projects)
3. Builds the Astro site
4. Deploys to GitHub Pages

**Note**: The existing `update-tle.yml` workflow remains the source of truth for nightly TLE updates.
