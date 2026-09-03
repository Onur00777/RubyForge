# RubyForge: The Crimson Path

A local Ruby learning game: overworld map, mission arena, and a real `ruby` CLI behind the editor.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires `ruby` and `git` on PATH.

## Layout

- `/` — The Crimson World map
- `/mission/[id]` — Coding Arena
- Passing tests writes `ruby_journey/stages/stage_XX_title.rb` and awards gems
- Milestones (every 5 stages) create a local git commit
