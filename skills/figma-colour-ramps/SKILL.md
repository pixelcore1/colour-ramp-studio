---
name: figma-colour-ramps
description: Build accessible 11-step colour ramps (50–950) in OKLCH from pinned key colours or straight out of an image, read existing ramps back out of a Figma file, edit tones by picker, L/C/H sliders or draggable perceptual curves, check WCAG 2.1 contrast, and write variables into any collection in a Figma file — including overwriting the exact variables a ramp came from, by id, so every fill, alias and published key keeps working. Use when someone asks for a colour ramp, colour scale, tint/shade scale, design-system palette, accessible colour system or brand colour tokens; wants a palette pulled out of a photo, screenshot or brand image; wants ramps imported from or pushed into Figma as variables; or is reskinning or rebranding a Figma file and needs the existing variables recoloured without breaking links.
---

# Figma Colour Ramps

Opens an interactive artifact for authoring perceptually uniform colour ramps and
writing them into a Figma file as variables.

The whole tool is one self-contained HTML file shipped in `assets/figma-colour-ramps.html`.
Your job is to bind it to this session's Figma tool and publish it as an artifact.
**Do not rewrite the HTML** — it is ~350 KB of tested colour maths, UI and Plugin API
scripts, with an embedded manual.

---

## Step 1 — Preflight: is Figma reachable? (do this first, always)

The Figma MCP server is registered under a **per-session id** such as
`mcp__3f8a91c2-…__use_figma`. It changes between sessions, so it must never be
hardcoded. Resolve it live:

1. Call `ToolSearch` with `query: "use_figma figma variables"` and a generous
   `max_results` (10+). Look for a tool whose name matches `^mcp__.+__use_figma$`.
   Record the **exact** full name.
2. If found, confirm the server is actually authorised — not merely registered —
   by calling the sibling `whoami` tool (`mcp__<same id>__whoami`). A successful
   call returns the user's handle, email and plans.

Three possible outcomes:

| Outcome | What to record | What to tell the user |
|---|---|---|
| `use_figma` found **and** `whoami` succeeds | `TOOLS = ["<full tool name>"]`, `STATUS = ""` | Nothing special — reading from and writing to Figma will work. |
| `use_figma` found but `whoami` fails or reports no access | `TOOLS = ["<full tool name>"]`, `STATUS = "The Figma MCP server is registered but not authorised."` | Warn: they must authorise the Figma connector before import or write will work. |
| No matching tool | `TOOLS = []`, `STATUS = "No Figma MCP server is registered in this session."` | Warn clearly, **before** building: authoring, image extraction and every export still work, but **From Figma** and **Write to a Figma file** will be unavailable. Paste tokens and Copy / Download are the way round it. |

State the warning in your reply as plain prose, not only inside the artifact.
Point at the three fixes, in this order:

1. **The session must be running *On my computer*.** Cowork asks where to run a task
   before it starts; a cloud session has no route to an MCP server listening on the
   user's own machine, so the Figma steps cannot work there no matter what else is
   set up. Check this first — it is the most common cause and the least obvious.
2. Authorise the Figma connector in connector settings.
3. Make sure the Figma **desktop** app is running with its MCP server enabled
   (Quick Actions → `MCP` → *Enable desktop MCP server*, or Dev Mode → right sidebar).

The tool also self-heals: if the injected name is stale it probes a short list of
conventional names at connect time and remembers whichever answers. The preflight
is what lets you *warn ahead of time* rather than after a failed click.

---

## Step 2 — Build and publish the artifact

1. Read `assets/figma-colour-ramps.html` from this skill's directory.
2. Copy it to your outputs folder.
3. Replace the block delimited by `FIGMA-TOOL-BINDING:START` / `FIGMA-TOOL-BINDING:END`
   so the injected script reads:

   ```html
   <script>
   window.__FIGMA_TOOLS__  = ["mcp__<resolved-session-id>__use_figma"];
   window.__FIGMA_STATUS__ = "";
   </script>
   ```

   With no Figma server, use `[]` and put the reason in `__FIGMA_STATUS__`.
   Use a scripted substitution (python/node), never hand-editing — the file is large
   and a stray character breaks the whole artifact.

4. Call `create_artifact` with:
   - `id`: `figma-colour-ramps`
   - `html_path`: the copied file
   - `mcp_tools`: `["mcp__<resolved-session-id>__use_figma"]`, or omit entirely when
     no server was found. **This allowlist is required** — the artifact cannot call a
     tool that is not declared here.

If an artifact with that id already exists, use `update_artifact` instead.

---

## Step 3 — Hand over

Say in two or three sentences what the tool does and where to start. Point at the
**Help** link at the bottom left — the full manual lives inside the tool, so do not
repeat it in chat. Mention the Figma warning here if Step 1 raised one.

The desk starts **empty**, with four ways in: *New ramp*, *From an image*,
*From Figma*, *Starter set*.

---

## How the tool works (for answering questions)

**Ramp model.** Eleven steps: 50, 100, 200 … 900, 950. The user pins one or more key
colours to specific steps; those hexes are reproduced exactly. The other tones come
from warping a reference OKLab lightness ladder and a bell-shaped chroma profile so
the curves pass through every pinned key, then gamut-mapping to sRGB by reducing
chroma at fixed lightness and hue. A plain tone edit is an **override** on one step;
*Make this a key colour* pins it and rebuilds the rest of the ramp around it.

**Why OKLCH.** In sRGB and HSL, equal lightness numbers look wildly different across
hues — yellow reads far lighter than blue at the same value. OKLab fixes that and,
unlike CIELAB, does not shift blues towards purple. Contrast follows lightness, so a
uniform lightness ladder is what makes a palette predictably accessible. Chroma
tapers at both ends because the sRGB gamut pinches to a point at white and black.

**Key colours from an image.** *From an image* opens a full-screen extractor. The
image is downscaled by progressive halving, converted to OKLab and clustered with
deterministic k-means++; chroma and lightness cut-offs drop the sky, skin and paper
that dominate a photo, ranking tilts towards colourfulness rather than raw area, and
a hue-separation rule refuses to return five near-identical blues. The hue × chroma
chart is the tuning instrument: every pixel is plotted and the numbered markers can
be dragged onto a cluster, snapping to the mean of the pixels around the drop point.
Headline settings are the count (3–8) and two toggles; the clustering parameters live
under *More settings*. **Generate N ramps** makes one ramp per ticked colour.

**Reading ramps out of Figma.** *From Figma* takes a file link and scans **every**
collection — no naming is assumed. The result is a tree of collection → groups →
tones with a checkbox on every branch and leaf. A whole group becomes a ramp; a
single variable seeds a new ramp under a name you give. Imported ramps keep the
file's own colours exactly: the tool picks a key colour, generates a ramp, and stores
every tone the generator would not have produced as an override. A ramp this tool
wrote re-imports with zero overrides.

**Provenance.** An imported ramp carries a Figma glyph beside its name and, behind
it, the **variable id of every tone** plus file key, collection, group and mode. The
name matches Figma exactly. Rename it and the old path stays visible underneath as
`was Colours/blue`, with a green dot in the list where there is no room for the path.

**Editing.** Three surfaces, all live: a split *Edit tone* panel with the original on
the left and the edit on the right; L / C / H sliders and a hex-first picker; and
draggable points on the perceptual curves, committed with *Save ramp* or rolled back
with *Discard edits*. Renaming is done with the pencil beside the ramp name.

**Curves.** Lightness should fall smoothly — a flat stretch means two tones that read
alike, a cliff means a visible jump. Chroma is normally a hump peaking around
500–600; clipped flat at the top means the gamut ran out. Hue is near-flat unless a
hue shift is set. Useful order: lightness first, then chroma, hue last and sparingly.

**Contrast.** WCAG 2.1 ratios against white and black for every step, plus an 11 × 11
tone-against-tone matrix. On the export grid an *Overlay* dropdown writes hex, WCAG
ratios or raw L/C/H into every cell.

**Saving work.** *Save work* downloads a readable JSON snapshot — ramps, key colours,
shape settings, overrides, Figma provenance — carrying a **checksum** over a
canonical form of the data. Reformatting the file still verifies; a changed value is
reported on load and the user decides whether to continue. The desk itself lives in
session storage: a reload keeps it, a new session starts clean.

**Where variables go.** After connecting, step 1 offers **Where to write**: any
collection in the file or a new one, an optional group (empty means the root, nesting
like `Core/Colours` works), and a mode picker that appears only when the collection
has more than one. Defaults aim at wherever the ramps on the desk came from. Variable
names are `<group>/<Ramp>/<step>`; Figma reads the slashes as folders. Each variable
carries five scopes, a description with the hex, and `codeSyntax` `var(--ramp-step)`.

**Overwriting in place — the reason this tool exists.** Ticking *Overwrite ramp in
Figma* writes a ramp onto the very variables it was read from, addressed by **id**.
An id survives both a rename and a value change, so fills, strokes, effects, aliases
from other variables and the published key other files consume all keep pointing at
the same variable and repaint on their own. Nothing needs relinking because nothing
was ever unlinked. If the group holds fewer than eleven variables the missing tones
are created alongside; if it holds more, the extras are left untouched with their old
colours and reported by name. A group in Figma is only a prefix on a name, so on a
rename those extras stay behind under the old prefix. The switch is off by default
and unavailable when the ramp came from a different file, grew from a single colour,
or no file is connected.

**Conflicts and warnings.** A name already in use at the chosen address opens a
dialog with four choices per ramp — update values, rename mine, rename theirs, skip —
each with its own explanation. Pressing write then opens *Before writing* whenever
there is anything to say: what will be overwritten, renamed, completed, left behind
or duplicated. Every card there has a checkbox, so a doubtful ramp can be dropped
without leaving the dialog. No warnings means the write just runs.

**Writing.** One call per ramp, so a failure pins to a single ramp. Afterwards
everything is read back out of the file and compared — by name for fresh writes, by
id for in-place ones — and the result reports matches, misses and drift.

**Export formats.** *Figma REST API* (a body for `POST /v1/files/<key>/variables`,
four arrays tied by temporary ids, Enterprise only), *Design tokens* (W3C DTCG, what
Tokens Studio, Style Dictionary and the community import plugins read), plain JSON,
and CSS custom properties. All four follow the chosen collection and group.

---

## Troubleshooting

- **"Figma is not connected in this session"** — Step 1 found no server. Rebuild the
  artifact after authorising the connector.
- **"The Figma MCP server did not answer"** — the injected name was stale *and* none
  of the fallbacks matched. Re-run Step 1 and rebuild.
- **"This view cannot reach Figma from here"** — the artifact is open outside
  Cowork's MCP bridge, or the session is running in the cloud rather than
  *On my computer*. Use Copy / Download, or Paste tokens for import.
- **Write refused after connecting** — the seat on that file is view or comment only;
  variables need edit rights.
- **A new group appeared instead of the old one changing** — *Overwrite* was off for
  that ramp, or the connected file is not the file it was imported from. The warning
  dialog flags this as *Writes a duplicate*.
- **A ramp shows clipped tones** — expected for saturated yellows, oranges and reds
  at the dark end; the chroma curve flattens at the real sRGB ceiling.
- **The extractor returns fewer colours than asked** — the image holds that few
  distinct hues at the current separation. Lower *Min hue separation*.
- **The extractor returns almost nothing** — a desaturated image; lower *Min chroma*.
- **An imported ramp is covered in hand edits** — expected. The file's colours are
  kept exactly and anything the generator would not have produced is preserved.

There is no undo inside the tool. Once variables are written the old values are gone
from the file — Figma's own undo is the way back. Before a real reskin, duplicate the
file or work on a branch.

No server, no analytics, no network access beyond the MCP bridge.
