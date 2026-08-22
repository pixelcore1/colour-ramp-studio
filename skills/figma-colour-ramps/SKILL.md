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
Point at the fixes, in this order:

1. Authorise the Figma connector in connector settings.
2. Make sure the Figma app is running with its MCP server enabled
   (Quick Actions → `MCP` → *Enable desktop MCP server*, or Dev Mode → right sidebar).
3. Only if they are using the **desktop** Figma MCP server rather than the remote one:
   the session has to be running *On my computer*, since a cloud session cannot reach
   a server listening on their own machine. The remote server works either way — so do
   not lead with this, and do not claim it explains a failure you have not confirmed.

The tool also self-heals: if the injected name is stale it probes a short list of
conventional names at connect time and remembers whichever answers. The preflight
is what lets you *warn ahead of time* rather than after a failed click.

---

## Step 2 — There may be nothing to build

**The artifact persists.** A Cowork artifact is a file on this machine
(`…/Claude/Artifacts/figma-colour-ramps/index.html`) that survives every session and
keeps its own bridge. If it has been published once on this computer, the fastest and
most reliable launch is to **open it, not rebuild it**.

So start here — and search by **keyword, not by exact name**:

```
ToolSearch  query: "artifact publish html page"   max_results: 20
```

Read every result. What publishes an artifact has been named differently across
versions of the app, so do **not** conclude anything from a `select:` on one exact
name coming back empty. Look for any tool whose name contains `artifact`, then check
its schema for a field that declares MCP tools — `mcp_tools` or equivalent.

- **A tool with an `mcp_tools`-style field exists** → that is the publisher. Use it,
  and go on to Step 3.
- **A tool called `Artifact` (or similar) exists but has no way to declare MCP
  tools** → it can render the page but cannot grant it the Figma bridge. Publishing
  through it produces a tool where authoring works and both Figma buttons are dead.
  Say so plainly rather than shipping that.
- **Nothing with `artifact` in the name at all** → see below.

Then, if a publisher was found, call its list-equivalent
(`mcp__cowork__list_artifacts` where that server is present).

- **An artifact with id `figma-colour-ramps` already exists** → say so and tell the
  user to open it from the sidebar under **Artifacts** (it carries a "Cowork" label).
  Only rebuild if the shipped HTML is newer than the artifact, or if the user reports
  the panel saying the Figma MCP server did not answer — that means the tool name
  baked into its allowlist has gone stale.
- **It does not exist** → go to Step 3 and publish it.

### If the artifact tools are not in this session

This is the one failure everybody hits, so read it carefully rather than guessing.

The publishing tools are **provisioned per session by the server**, and their names
have changed between versions of the app — so search by keyword first (above) before
deciding they are missing. The desktop app registers them at startup, but a given session may be
created without them — the same account, the same machine, the same app. Sessions
created earlier keep working while a brand-new one is denied. So the absence of these
tools is **not** evidence that the user is in the cloud, on the wrong surface, or has
something misconfigured. Do not tell them it is.

What actually helps, in order:

1. **Open the existing artifact from the Artifacts view.** Cowork sidebar → Artifacts
   → "Figma Colour Ramps". It runs with a full bridge regardless of which tools this
   chat session was given. If it exists, this alone solves the problem.
2. **Start a session that is artifact-capable by construction.** Artifacts view →
   **New artifact** → **Create Cowork artifact**. A session opened that way has the
   artifact tools, and the skill can be run inside it.
3. **Retry once.** Provisioning can lag in a freshly created session. Ask the user to
   send one more message and run the ToolSearch again before concluding anything.
4. **Check the app is current.** Live artifacts need a recent Claude Desktop; they are
   desktop-only and on paid plans.

Never hand over the HTML as a plain file instead. A file has no
`window.cowork.callMcpTool`, so both Figma buttons are dead in it, and the editor's
generic `Artifact` tool produces exactly the same dead page. Without a bridge the tool
still builds ramps, reads images, checks contrast and exports every format, and
**Paste tokens** imports without any connection — say that, and leave it there.

---

## Step 3 — Build and publish

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

4. Call `mcp__cowork__list_artifacts` first. If one with id `figma-colour-ramps`
   already exists, use `mcp__cowork__update_artifact`; otherwise
   `mcp__cowork__create_artifact`. Arguments either way:
   - `id`: `figma-colour-ramps`
   - `html_path`: the copied file
   - `mcp_tools`: `["mcp__<resolved-session-id>__use_figma"]`, or omit entirely when
     no server was found. **This allowlist is required** — the artifact cannot call a
     tool that is not declared here, even though the name is also injected into the
     HTML. Both are needed: the allowlist grants permission, the injected name tells
     the tool what to call.

5. **Always** call `mcp__cowork__verify_artifact` with the same id, and read the log.
   The tool prints one line at boot that settles the question:

   ```
   [figma-colour-ramps] bridge: ok | window.cowork: present | callMcpTool: function | declared tools: ["mcp__…__use_figma"]
   ```

   - `bridge: ok` — done, both Figma buttons will work.
   - `bridge: no-runtime`, `window.cowork: absent` — it was **not** published through
     Cowork. Republish with `mcp__cowork__create_artifact`; do not tell the user the
     session lacks a runtime until you have tried that tool by its exact name.
   - `bridge: no-tools` — published correctly, but `mcp_tools` was empty or the
     binding was not injected. Redo step 3 with the resolved Figma tool name.
   - No log at all — the artifact is not open; that alone is not a failure.

---

## Step 4 — Hand over

Say in two or three sentences what the tool does and where to start. Point at the
**Help** link at the bottom left — the full manual lives inside the tool, so do not
repeat it in chat. Mention the Figma warning here if Step 1 raised one.

The desk starts **empty**, with four ways in: *New ramp*, *From an image*,
*From Figma*, *Starter set*.

Tell them once that it now lives in the Cowork sidebar under **Artifacts** and can be
reopened from there any time — no need to run this skill again in a future session.

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
collection — no naming is assumed. The scan is **paged**: one small call for the shape
of the file, then slices of 60 variables in a compact array form. That is not an
optimisation — the bridge truncates a tool result at about 20 KB, and a real design
system in one reply comes back cut in half and stops being JSON. The result is a tree of collection → groups →
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

- **The skill says it cannot build anything** — `mcp__cowork__create_artifact` was not
  provisioned into this session. That is a server-side capability gate, not a user
  error. Point at the Artifacts view first: the artifact is already on their machine
  and opens with a working bridge. See Step 2.
- **"Figma is not connected in this session"** — Step 1 found no server. Rebuild the
  artifact after authorising the connector.
- **"The Figma MCP server did not answer"** — the injected name was stale *and* none
  of the fallbacks matched. Re-run Step 1 and rebuild.
- **"This view cannot reach Figma from here"** — the page is not running as a Cowork
  artifact: handed over as a file, or published with the editor's generic `Artifact`
  tool. Open the real one from the Artifacts view, or republish through
  `mcp__cowork__create_artifact`.
- **The artifact opens but says the Figma MCP server did not answer** — it was
  published in an earlier session and the tool name in its allowlist has gone stale.
  Republish it from a session that has the artifact tools; the id is per-session and
  cannot be baked in.
- **"Figma is not connected in this session" right after launch, with the connector
  authorised** — read the message: the tool now names the cause itself. *"This page is
  not running as a Cowork artifact"* means it was published with the wrong tool or
  handed over as a file — republish with `mcp__cowork__create_artifact`. *"no Figma
  MCP tool was declared for this view"* means the publish was right but `mcp_tools`
  or the injected binding was empty — redo step 3.
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
- **Import fails with a wall of JSON** — an older build read the whole file in one
  call and the bridge cut it off at 20 KB. Republish the artifact from this skill;
  the scan is paged now.
- **An imported ramp is covered in hand edits** — expected. The file's colours are
  kept exactly and anything the generator would not have produced is preserved.

There is no undo inside the tool. Once variables are written the old values are gone
from the file — Figma's own undo is the way back. Before a real reskin, duplicate the
file or work on a branch.

No server, no analytics, no network access beyond the MCP bridge.
