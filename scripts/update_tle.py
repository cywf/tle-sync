import os, requests
from notion_client import Client

# env vars
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
LEO_DB     = os.getenv("NOTION_LEO_DB_ID")
GEO_DB     = os.getenv("NOTION_GEO_DB_ID")

notion = Client(auth=NOTION_TOKEN)

def fetch_catids(db_id):
    pages = []
    cursor = None
    while True:
        resp = notion.databases.query(db_id, start_cursor=cursor)
        pages += resp["results"]
        if not resp["has_more"]:
            break
        cursor = resp["next_cursor"]
    return [p["properties"]["CATID"]["number"] for p in pages]

def fetch_and_write(cat_id, orbit):
    url = f"https://celestrak.com/NORAD/elements/gp.php?CATNR={cat_id}&FORMAT=TLE"
    r = requests.get(url)
    lines = r.text.strip().splitlines()
    folder = f"../tle_data/{orbit.lower()}"
    os.makedirs(folder, exist_ok=True)
    path = f"{folder}/{cat_id}.tle"
    with open(path, "w") as f:
        f.write("\n".join(lines))

def update_notion_tle(cat_id, orbit):
    # find page with that CATID
    db_id = LEO_DB if orbit=="LEO" else GEO_DB
    resp = notion.databases.query(db_id, filter={
        "property":"CATID","number":{"equals":cat_id}
    })
    if not resp["results"]: return
    page_id = resp["results"][0]["id"]
    tle = open(f"../tle_data/{orbit.lower()}/{cat_id}.tle").read().splitlines()
    notion.pages.update(page_id, properties={
        "TLE Line 1": {"rich_text":[{"text":{"content":tle[0]}}]},
        "TLE Line 2": {"rich_text":[{"text":{"content":tle[1]}}]},
    })

def main():
    for orbit, db_id in [("LEO", LEO_DB), ("GEO", GEO_DB)]:
        for cat in fetch_catids(db_id):
            fetch_and_write(cat, orbit)
            update_notion_tle(cat, orbit)

if __name__=="__main__":
    main()
