# Figma Colour Ramps

A Claude skill that opens a workbench for eleven-step colour ramps — 50, 100, 200 … 900, 950 — built in OKLCH, checked against WCAG 2.1, and written straight into a Figma file as variables.

The point of it is the last part. A ramp read out of a Figma file remembers the **id of every variable** it came from, so it can be written back onto those same variables. Ids survive both a rename and a value change, which means fills, strokes, aliases and published library keys all keep pointing where they pointed. Layers repaint on their own. Nothing needs relinking — and a rebrand stops being a week of manual work.

---

## Requirements

Four things, and the fourth is the one people miss.

| | Needed for |
|---|---|
| [Claude desktop app](https://claude.ai/download), current version | Everything — artifacts are desktop-only, on paid plans |
| The **Figma connector** in Claude | Reaching Figma at all |
| [Figma desktop app](https://www.figma.com/downloads/) with its MCP server on | Reading ramps out of a file, writing them back |
| A session that can **publish an artifact** | See *First run* below — this is the step that trips people up |

Without Figma the tool still builds ramps, pulls colours out of images, checks contrast and exports to Figma REST payloads, W3C design tokens, JSON or CSS. Only the two Figma buttons go quiet, and **Paste tokens** still imports without any connection.

---

## Install

### 1. Get the skill

Download [`figma-colour-ramps.skill`](figma-colour-ramps.skill) from this repository — or clone it and run `./build-skill.sh` to build the archive yourself from `skills/`.

### 2. Install it

In the message box, switch the mode toggle to **Cowork**. Drag the `.skill` file into the conversation and press **Save skill**. It stays installed across sessions and machines.

### 3. Connect Figma to Claude

**Settings → Connectors → Browse connectors**, find **Figma**, connect. Details: [Use connectors to extend Claude's capabilities](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities).

### 4. Turn on the Figma MCP server

Open the **Figma desktop app**, open a Design file, then either:

- open Quick Actions with <kbd>Ctrl</kbd>+<kbd>/</kbd>, type `MCP`, and tick **Enable desktop MCP server**, or
- switch to **Dev Mode** and enable the MCP server in the right-hand sidebar.

Keep the Figma app running while you work. Figma's own instructions: [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) and [Set up the desktop server](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/). If you use the **desktop** server rather than the remote one, the session has to run locally — a cloud session cannot reach a server on your own `127.0.0.1`.

---

## First run — build the artifact from the Artifacts view

Ten seconds, and it saves a lot of confusion later.

1. In the Claude desktop app, open **Artifacts** in the left sidebar.
2. **New artifact** (top right) → **Create Cowork artifact**.
3. In the session that opens, run:

   ```
   /figma-colour-ramps
   ```

The skill resolves your Figma tool, builds the page and publishes it. It should finish by reporting `bridge: ok`.

**Why not just run it in any chat?** The tools that publish an artifact are handed to a session *by the server*, and an ordinary new session is sometimes created without them — same account, same machine, same app. When that happens the skill can reach Figma perfectly well and still have nothing to publish with, and both Figma buttons come up dead. Starting from the Artifacts view sidesteps the question. (See [#51426](https://github.com/anthropics/claude-code/issues/51426) and [#76095](https://github.com/anthropics/claude-code/issues/76095) for the detail.)

---

## Every run after that — just open it

The artifact is a real file on your machine:

```
…/Claude/Artifacts/figma-colour-ramps/index.html
```

It persists. **Artifacts → "Figma Colour Ramps"** opens it with its bridge intact, in any session, without running the skill again. That is how you use it day to day.

Open it that way, not by double-clicking the HTML. The same file opened in a browser has no bridge, so both Figma buttons are inert.

To check the setup end to end: **Export ramps → Write to a Figma file**, paste a file link, press **Connect**. A working setup names the file, confirms write access and lists the collections it found.

### When to re-run the skill

- You pulled a newer version from this repository — **republish, then reopen the artifact**. An already-open window keeps the old page in memory; close it, or use the reload button in the artifact header.
- The write panel says *the Figma MCP server did not answer* — the tool id baked into the artifact's allowlist has gone stale.

---

## If something is wrong

The tool diagnoses itself. Open it and read the message in the Figma panel:

| What it says | What it means | What to do |
|---|---|---|
| *This page is not running as a Cowork artifact* | Opened as a plain file, or published by a tool that cannot grant the bridge. | Open it from the Artifacts view, or re-run the skill from a session created there. |
| *no Figma MCP tool was declared for this view* | Published correctly, but Figma was not connected when it was built. | Connect the Figma connector, then re-run the skill. |
| *The Figma MCP server did not answer* | Built in an older session; the tool id it holds is stale. | Re-run the skill to republish. |
| Import fails with a wall of raw JSON | An old build read the whole file in one call and the bridge cut it off at 20 KB. | Re-run the skill, then reopen the artifact. Current builds read in pages. |
| Nothing — Connect just fails | Figma app closed, MCP server off, or a view-only seat on the file. | Check those three, in that order. |

If the skill itself reports that it cannot publish anything, the session was not given the publishing tools. Open the existing artifact from the Artifacts view, or start again from **New artifact → Create Cowork artifact**.

---

## What it does

**Building ramps.** Pin one or more key colours at the steps you choose; the tool builds the other tones around them — a warped lightness ladder through your pins, a bell-shaped chroma envelope, shortest-arc hue interpolation, and gamut mapping by chroma search so nothing falls outside sRGB. Five shape controls reach the whole ramp at once.

**Colours out of an image.** Drop in a photo, a screenshot or a brand board. A hue × chroma plot of every pixel is the control surface — drag markers to place key colours, snap them to the cluster underneath, ask for three to eight plus the dominant neutral. Clustering is k-means++ in OKLab with a fixed seed, so the same image always gives the same answer.

**Reading ramps out of Figma.** Scans every collection in a file, no naming assumed, and offers a tree with a checkbox on every group and tone. Large files are read in pages — the bridge truncates any single reply at about 20 KB, so a whole design system in one call would come back cut in half. Imported ramps keep the file's colours exactly and remember the id of every variable they came from.

**Editing.** Any tone by picker or L/C/H sliders, with the original and the edit side by side. Three perceptual curves — lightness, chroma, hue — directly draggable, swatches updating under your hand. A kink in the lightness line is far easier to spot than an odd swatch in a row.

**Measuring.** Contrast against white and black for every tone, plus a full tone-against-tone matrix for the question that actually comes up: *can this text sit on that background?*

**Writing into Figma.** Choose any collection or create one, choose a group or write at the root, choose a mode when there is more than one. Name conflicts are resolved per ramp. A warning dialog spells out every consequence before anything changes, and any ramp can be dropped from the write right there. Afterwards everything is read back out of the file and compared, value by value.

**Overwriting in place.** The reason the tool exists. See [HELP.md](HELP.md#overwriting-in-place).

**Saving work.** Snapshots are readable JSON with a checksum, so a file damaged in transit is caught on load. Reformatting is fine; a changed value is reported.

---

## What is in this repository

```
figma-colour-ramps.skill          installable archive — this is what you download
skills/figma-colour-ramps/
  SKILL.md                        how Claude runs the tool, and what it knows about it
  assets/figma-colour-ramps.html  the tool itself, one self-contained file
build-skill.sh                    rebuilds the .skill archive from skills/
tests/                            three jsdom suites that drive the real HTML
HELP.md                           the full manual
README.md                         this file
```

The tests need only `npm install jsdom`; see [`tests/README.md`](tests/README.md).

The HTML has no build step and no dependencies. Open it in a browser and everything except the two Figma buttons works.

---

## Documentation

[**HELP.md**](HELP.md) is the full manual — every feature from creating a ramp to writing it back, how to read and use the curves, and a long section on overwriting in place and why it matters. The same document is built into the tool, behind the **Help** link at the bottom left.

---

## Notes and credits

The colour maths follows [Björn Ottosson's OKLab](https://bottosson.github.io/posts/oklab/), chosen over CIELAB because CIELAB bends blues towards purple as they darken. The case for perceptual lightness in design-system ramps is made well in [Stripe's *Designing accessible color systems*](https://stripe.com/blog/accessible-color-systems). Contrast numbers follow [WCAG 2.1](https://www.w3.org/TR/WCAG21/#contrast-minimum); the token export follows the [W3C Design Tokens format](https://tr.designtokens.org/format/).

Nothing leaves your machine. There is no server, no analytics, no account. Work lives in the browser tab for the session and in the snapshot files you save.

---

## Contributing and contact

Found a bug? Open an issue, or write to **pixelcore@gmail.com**.

If it saved you an afternoon: [buy me a coffee](https://buymeacoffee.com/mikenahlii).

---

## Licence

[MIT](LICENSE) © 2026 Mike Nahlii

Do what you like with it, including commercially, as long as the copyright notice travels with it.
