# PhilWorld

A small pixel-art RPG for exploring philosophy. You walk through 10 rooms, meet thinkers, and come to understand each big idea by *doing* something, seeing it, and hearing it. All art, music and sound are generated in code, with no asset files.

## Play it

**Play in your browser:** https://pattag0bi.github.io/philworld/

Or run it locally:

```bash
cd ~/philworld && python3 -m http.server 8765
```

Then open http://localhost:8765. Headphones are recommended.

## Controls

- **Arrows / WASD**: walk
- **E / Space**: interact
- **M**: roadmap of ideas
- **J**: journal
- **H**: hint from Glaux the owl
- **N**: sound on/off
- **B**: bow (unlocked at Confucius's courtyard)
- **V**: voices on/off
- **P**: story pictures on/off

## Rooms

| Road | Room | Big idea |
|---|---|---|
| Hub | The Crossroads | Philosophy begins in wonder; the five branches |
| West | The Agora | Socrates' method: "I know that I know nothing" |
| West | Plato's Cave *or* Aristotle's Lyceum | The Cave & the Forms / the Golden Mean |
| West | The Painted Stoa | The Stoic dichotomy of control |
| West | Nietzsche's Mountain | Death of God, creating values, eternal recurrence |
| East | Confucius's Courtyard | Ren, li, harmony of relationships |
| East | Laozi's Valley | Wu wei, yin & yang, emptiness |
| East | The Bodhi Tree | Four Noble Truths, Middle Way, letting go |
| Finale | The Existentialist Café | Sartre, Beauvoir, Camus: freedom and the absurd |

## Code map

- `js/core.js`: canvas, input, save, async scripting
- `js/audio.js`: Web Audio synth, per-room soundscapes, sound effects
- `js/gfx.js`: pixel drawing (people, props, icons)
- `js/data.js`: characters, insight cards, roadmap nodes
- `js/ui.js`: dialog, insight cards, journal, roadmap, HUD
- `js/world.js`: rooms, player, doors, collisions
- `js/rooms/*.js`: one file per room
- `js/main.js`: loop, title screen, character creator

## Show, don't tell

Every line of dialog comes with a story picture: a panel that illustrates what is being said, built from a library of about 75 pixel motifs picked by keywords in the line. The big stories are acted out as cutscenes in the rooms themselves: Socrates' trial, the Oracle, the gadfly, Zeno's shipwreck, Epictetus's leg, Marcus's morning, the madman with the lantern, the Shao music, Laozi at the border, Cook Ding, the Four Sights, Kisa Gotami, the waiter's bad faith, Beauvoir's "becoming", the absurd, and Sartre's student.

## Voices (Sarvam AI)

Every character is voiced with [Sarvam AI](https://www.sarvam.ai/)'s Bulbul v4 English (India) voices. The clips are generated once and shipped in `audio/voice/`; the API key is never part of the game.

```bash
export SARVAM_API_KEY=...   # your key, kept out of git
cd tools && npm install && npm run extract && npm run voices
```

`tools/voices.json` decides which Sarvam persona voices each character. Change one and run `npm run voices` again; only the changed lines are regenerated. Use `npm run voices -- --sample` to try 12 lines first.

## Saving

Progress saves automatically: your character, insights, finished puzzles, the room you're in, and where you're standing (every few seconds, and whenever you close or switch away from the tab). Choose **Continue journey** on the title screen to pick up where you left off.

Saves live in each player's own browser, and clearing site data erases them. To move a journey to another browser or device, choose **Copy save code** on the title screen, open PhilWorld in the other browser, choose **Enter save code**, and paste the code. A copied code also works as a backup.
