# Drop Thor's images here

Each folder decides how the importer treats the image, so put things in the
right one. Then run `npm run import:assets` (see the bottom of this file).

| Folder | What goes in it | Becomes |
|---|---|---|
| `work/` | Tattoo photos on skin — healed and fresh. Also photographed drawings, originals and prints. | A **Works** entry, shown in the gallery at `/work` |
| `designs/` | Flash and available designs from [@lampkey_tattoo_designs](https://www.instagram.com/lampkey_tattoo_designs/) — drawings Thor wants to tattoo | An **Available design** at `/designs`, with a "Claim this design" button |
| `events/` | Flyers for flash days, life drawing nights, conventions | Flyer images only. Dates are added by hand in Keystatic so they get a real date and venue — flyers are deliberately kept **out** of the gallery |
| `thor/` | Photos of Thor himself and of the studio | The home page portrait and the About page. Pick one for the home page in Site settings |
| `video/` | Short vertical clips (Reels format) of a piece coming together | The Process section |

## Two things worth getting right

**File names become titles.** `ghostface-forearm.jpg` imports as "Ghostface
Forearm". `IMG_4821.jpg` imports as "IMG 4821", which you then have to rename
by hand. Naming the files before you upload saves the most time of anything
here.

**Alt text is left blank on purpose.** The importer will not invent a
description of a piece it cannot see. Every entry arrives with
`alt: 'TODO: describe this piece'`, and writing those in Keystatic is what
makes the site work for screen readers and for search. It is the one bit of
data entry that cannot be skipped.

Everything else the importer guesses — title, styles, date, and the Instagram
permalink if `captions.json` is present — is a starting point you can correct
in Keystatic.

## Captions, if you have them

If you ran `download-instagram-assets.py`, it writes `assets/captions.json`
alongside these folders. Drop that in too and the importer will carry each
post's caption across as the piece's note, in Thor's own words, plus its date
and permalink. Without it everything still imports; you just write the captions
yourself.

## Then

```bash
npm install
npm run import:assets              # adds everything new; never overwrites
npm run import:assets -- --clean   # also deletes the 14 placeholder seed entries
npm run dev                        # check it at localhost:3000, edit at /keystatic
```

The importer re-encodes images to a sane maximum size, so originals can be as
large as they come off the camera. It skips anything already imported, so it is
safe to run again after adding more.
