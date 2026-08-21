# Figma Colour Ramps

A Claude skill that opens a workbench for eleven-step colour ramps — 50, 100, 200 … 900, 950 — built in OKLCH, checked against WCAG 2.1, and written straight into a Figma file as variables.

The point of it is the last part. A ramp read out of a Figma file remembers the **id of every variable** it came from, so it can be written back onto those same variables. Ids survive both a rename and a value change, which means fills, strokes, aliases and published library keys all keep pointing where they pointed. Layers repaint on their own. Nothing needs relinking — and a rebrand stops being a week of manual work.

---

## Requirements

**This runs in Claude Cowork, in the Claude desktop app.** Not the web version, not Cowork in the cloud.

**And the session must be set to run *On my computer*.** Cowork asks where to run a task before it starts — pick the local option, not the cloud one. In a cloud session the Figma steps simply will not work, however correctly everything else is set up. This is worth checking first when something refuses to connect.

That is not a preference — it is how the tool talks to Figma. Reading and writing variables goes through a local MCP bridge to the Figma desktop app on your machine, and [local connectors and local MCP servers work through the desktop app only](https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile). A cloud session has no route to a server listening on your `127.0.0.1`.

| | Needed for |
|---|---|
| [Claude desktop app](https://claude.ai/download) with Cowork | Running the skill at all |
| [Figma desktop app](https://www.figma.com/downloads/) with its MCP server enabled | Reading ramps out of a file, writing them back |
| A Dev or Full seat on the file | Creating and editing variables |

Without Figma connected the tool still builds ramps, pulls colours out of images, checks contrast and exports to Figma REST payloads, W3C design tokens, JSON or CSS. Only the two Figma buttons go quiet — and you can paste design tokens in instead of reading a live file.

---

## Install

### 1. Get the skill

Download [`figma-colour-ramps.skill`](figma-colour-ramps.skill) from this repository — or clone it and run `./build-skill.sh` to build the archive yourself from `skills/`.

### 2. Install it

Drag the `.skill` file into a Claude Cowork conversation and press **Save skill**. It stays installed across sessions.

### 3. Connect Figma to Claude

In the Claude desktop app: **Settings → Connectors → Browse connectors**, find **Figma**, connect. Details: [Use connectors to extend Claude's capabilities](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities).

### 4. Turn on the Figma MCP server

Open the **Figma desktop app**, open a Design file, then either:

- open Quick Actions with <kbd>Ctrl</kbd>+<kbd>/</kbd>, type `MCP`, and tick **Enable desktop MCP server**, or
- switch to **Dev Mode** and enable the MCP server in the right-hand sidebar.

It listens on `http://127.0.0.1:3845/mcp`. Figma's own instructions: [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) and [How to set up the Figma desktop MCP server](https://help.figma.com/hc/en-us/articles/35281186390679-Figma-MCP-collection-How-to-setup-the-Figma-desktop-MCP-server-alternative). For the Claude Code side of the same setup: [Claude Code and Figma: Set up the MCP server](https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server).

Keep the Figma desktop app running while you work. If it is closed, the bridge has nothing to talk to.

---

## Run

In a Cowork session, ask for a colour ramp — *"build me an accessible blue ramp"*, *"pull a palette out of this screenshot"*, *"import my colour variables from this Figma file"* — or invoke it by name:

```
/figma-colour-ramps
```

The skill checks whether Figma is reachable, tells you plainly if it is not, binds the tool to this session's Figma server and opens it as an artifact.

The Figma MCP server is registered under a **per-session id**, so it cannot be baked into the file. The skill resolves the live name each time it runs, and the tool probes for it again at connect time as a fallback. If the write panel says it cannot reach Figma, re-running the skill is usually the fix.

To check the setup end to end: **Export ramps → Write to a Figma file**, paste a file link, press **Connect**. A working setup names the file, confirms write access and lists the collections it found.

---

## What it does

**Building ramps.** Pin one or more key colours at the steps you choose; the tool builds the other tones around them — a warped lightness ladder through your pins, a bell-shaped chroma envelope, shortest-arc hue interpolation, and gamut mapping by chroma search so nothing falls outside sRGB. Five shape controls reach the whole ramp at once.

**Colours out of an image.** Drop in a photo, a screenshot or a brand board. A hue × chroma plot of every pixel is the control surface — drag markers to place key colours, snap them to the cluster underneath, ask for three to eight plus the dominant neutral. Clustering is k-means++ in OKLab with a fixed seed, so the same image always gives the same answer.

**Reading ramps out of Figma.** Scans every collection in a file, no naming assumed, and offers a tree with a checkbox on every group and tone. Imported ramps keep the file's colours exactly and remember where they came from.

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
HELP.md                           the full manual
README.md                         this file
```

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
