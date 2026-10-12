# RubyForge: The Crimson Path

A local Ruby learning game: overworld map, mission area, and a real `ruby` CLI behind the editor. Teaches you Ruby...

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires `ruby` and `git` on PATH.

## Sign-in

Create a smith with a handle + passphrase — that ledger always starts at Stage 01. Enter the forge with the same pair to load **only** that smith. Files live under `ruby_journey/.rubyforge/smiths/`.

Google is optional. Copy `.env.example` to `.env.local` if you want it.

## Layout

- `/` — The Crimson World map
- `/mission/[id]` — Coding Arena
- Passing tests writes `ruby_journey/stages/stage_XX_title.rb` and awards gems
- Milestones (every 5 stages) create a local git commit
