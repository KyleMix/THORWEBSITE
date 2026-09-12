#!/usr/bin/env python3
"""
Download Thor's Instagram images and videos from the Apify dataset into the
folder structure the Claude Code prompt expects, and write captions.json.

Usage:
  pip install requests
  python3 download-instagram-assets.py "<apify dataset url>" ./assets

Notes:
  - Instagram CDN links in the dataset expire after a few days. If downloads
    start failing with 403, re-run the Apify scraper and use the fresh URL.
  - Posts by other accounts are kept only when Thor is a co-author or tagged
    (the shop cross-posts his healed work; those photos are worth having).
"""
import json, os, sys, requests

if len(sys.argv) < 3:
    sys.exit(__doc__)

DATASET_URL, OUT = sys.argv[1], sys.argv[2]
THOR = {"thelampkeyartery", "lampkey_tattoo_designs"}
WORK, DESIGNS, EVENTS, VIDEO = [os.path.join(OUT, d) for d in ("work", "designs", "events", "video")]
for d in (WORK, DESIGNS, EVENTS, VIDEO):
    os.makedirs(d, exist_ok=True)

posts = requests.get(DATASET_URL, timeout=60).json()
captions = {}
session = requests.Session()
session.headers["User-Agent"] = "Mozilla/5.0"

def thor_involved(p):
    if p.get("ownerUsername") in THOR:
        return True
    people = [u.get("username") for u in p.get("taggedUsers", []) + p.get("coauthorProducers", [])]
    return any(u in THOR for u in people)

def bucket(p):
    cap = (p.get("caption") or "").lower()
    if p.get("ownerUsername") == "lampkey_tattoo_designs":
        return DESIGNS
    if any(k in cap for k in ("flash", "life drawing", "rsvp", "join us", "save the date")):
        return EVENTS
    return WORK

def save(url, path):
    if os.path.exists(path):
        return True
    r = session.get(url, timeout=60)
    if r.status_code != 200:
        print("  failed", r.status_code, os.path.basename(path))
        return False
    with open(path, "wb") as f:
        f.write(r.content)
    return True

count = 0
for p in posts:
    if not thor_involved(p):
        continue
    code = p.get("shortCode", p.get("id"))
    folder = bucket(p)
    meta = {
        "caption": p.get("caption") or "",
        "owner": p.get("ownerUsername"),
        "date": p.get("timestamp"),
        "url": p.get("url"),
        "hashtags": p.get("hashtags", []),
        "location": p.get("locationName"),
    }
    items = p.get("childPosts") or [p]
    for i, item in enumerate(items):
        suffix = f"-{i+1}" if len(items) > 1 else ""
        if item.get("type") == "Video" and item.get("videoUrl"):
            name = f"{code}{suffix}.mp4"
            if save(item["videoUrl"], os.path.join(VIDEO, name)):
                captions[name] = meta; count += 1
        url = item.get("displayUrl")
        if not url:
            continue
        name = f"{code}{suffix}.jpg"
        if save(url, os.path.join(folder, name)):
            captions[name] = meta; count += 1
    print("saved", code, "->", os.path.basename(folder))

with open(os.path.join(OUT, "captions.json"), "w") as f:
    json.dump(captions, f, indent=2)
print(f"\n{count} files saved. Captions written to {OUT}/captions.json")
print("Next: look through assets/work and move any photos of Thor himself into assets/thor.")
