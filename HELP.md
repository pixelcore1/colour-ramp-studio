# Figma Colour Ramps — help

## Contents

- [What this tool is](#what-this-tool-is)
  - [Why OKLCH and not HSL](#why-oklch-and-not-hsl)
  - [The layout](#the-layout)
- [Four ways to start](#four-ways-to-start)
- [Building a ramp by hand](#building-a-ramp-by-hand)
  - [More than one key colour](#more-than-one-key-colour)
  - [Ramp shape](#ramp-shape)
- [Pulling colours from an image](#pulling-colours-from-an-image)
- [Reading ramps out of Figma](#reading-ramps-out-of-figma)
  - [The Figma mark](#the-figma-mark)
- [Editing one tone](#editing-one-tone)
- [Working with the curves](#working-with-the-curves)
  - [Reading them](#reading-them)
  - [Dragging a point](#dragging-a-point)
- [Contrast and accessibility](#contrast-and-accessibility)
- [Interface preview](#interface-preview)
- [Saving and loading](#saving-and-loading)
- [Export formats](#export-formats)
- [Writing into a Figma file](#writing-into-a-figma-file)
  - [1 · Connect and check](#1-connect-and-check)
  - [Where to write](#where-to-write)
  - [2 · What will be written](#2-what-will-be-written)
  - [Name conflicts](#name-conflicts)
  - [3 · Write](#3-write)
- [Overwriting in place](#overwriting-in-place)
  - [The problem it solves](#the-problem-it-solves)
  - [What it does instead](#what-it-does-instead)
  - [Renaming while overwriting](#renaming-while-overwriting)
  - [When the group is not eleven variables](#when-the-group-is-not-eleven-variables)
  - [When it is offered — and when it is not](#when-it-is-offered-and-when-it-is-not)
  - [Getting back](#getting-back)
- [The warnings before a write](#the-warnings-before-a-write)
- [Two common jobs](#two-common-jobs)
  - [Reskinning an existing file](#reskinning-an-existing-file)
  - [A new system from a brand image](#a-new-system-from-a-brand-image)
- [When something is wrong](#when-something-is-wrong)
- [Where the maths comes from](#where-the-maths-comes-from)

## What this tool is

A workbench for eleven-step colour ramps — 50, 100, 200 … 900, 950 — built in OKLCH, checked against WCAG, and written straight into a Figma file as variables.

Three things separate it from a gradient generator. Ramps are built in a **perceptually uniform space**, so a step of lightness looks like the same step whether the hue is yellow or blue. Every tone is **measurable** — contrast against white, against black, and against every other tone in the ramp. And a ramp read out of a Figma file can be **written back onto the very same variables**, which is what makes a reskin a job of minutes instead of days.

Nothing is stored on a server. Your work lives in the browser tab for the session and in the snapshot files you save yourself.

> Reading from and writing to Figma need a local bridge, so the Cowork session has to be running **On my computer** rather than in the cloud, with the Figma desktop app open and its MCP server enabled. Everything else — building ramps, pulling colours out of images, contrast, exports — works either way.

### Why OKLCH and not HSL

In HSL, `hsl(60 100% 50%)` is a blinding yellow and `hsl(240 100% 50%)` is a near-black blue, yet both claim 50% lightness. Anything built on that number produces ramps where one hue goes dark three steps before another. OKLab, published by Björn Ottosson in 2020, fixes this: its L axis matches what the eye reports. CIELAB gets most of the way there but bends blues towards purple as they darken — OKLab does not. So the ramp maths — lightness ladder, chroma envelope, hue interpolation, gamut clipping — all happens in OKLCH, and hex only ever appears at the edges, on input and on export.

### The layout

The left column is your desk: how to start, the list of ramps, and the buttons for export and for saving work. The right pane shows whatever ramp is selected — its tones, its editor, its curves, its contrast — or, on the **Export ramps** screen, all of them at once.

Click a ramp in the list to select it. Click it again to deselect. The chevron beside its name opens the editor for that ramp inline.

## Four ways to start

The **Create** panel at the top of the left column offers four entry points. It collapses itself once you have ramps on the desk, and comes back when the desk is empty.

**New ramp**  
Build one from a colour you already know. This is the path described in the next section.

**From an image**  
Pull key colours out of a photo, a screenshot or a brand board, then turn them into ramps in one go.

**From Figma**  
Read ramps that already exist in a Figma file. These come back marked, and can later be written back onto the same variables.

**Starter set**  
Five ramps — red, orange, green, blue and neutral — to poke at while you get a feel for the controls.

## Building a ramp by hand

A ramp is defined by its **key colours**, not by all eleven tones. You pin the colours you care about; the tool works out the rest.

1. Give the ramp a name. It becomes the variable name in Figma and the token name in every export, so name it the way your design system talks — `Blue`, not `blue-ish accent`.
2. Set the first key colour: pick the step it belongs to from the dropdown, then type a hex or click the swatch to open the picker. The picker opens in hex mode.
3. Press **Generate colour ramp**.

One key colour is enough. The tool places it at the step you chose and builds the other ten around it, keeping its hue and scaling its chroma along a bell-shaped curve that peaks in the middle of the ramp — the same shape you find in most mature design systems, because mid-tones can carry more chroma than either end without leaving the sRGB gamut.

### More than one key colour

**+ Add key colour** pins another. This is how you handle a brand that is not one hue stretched thin: a warm red at 500 and a cooler, deeper red at 900, for instance. Every pinned colour is reproduced exactly, and the tones between them are interpolated — lightness through a warped ladder, hue along the shortest arc, chroma normalised so that each key sits at its own measured chroma.

> Pinning two colours whose lightness runs the wrong way — a light colour at 900 and a dark one at 200 — gives you a ramp that reverses direction. The tool will build it, because sometimes that is what you meant, but it is almost always a mistake in the step numbers.

### Ramp shape

Under **show / hide** in the form sit five controls that reshape the whole ramp at once:

**Lightest tone (50) · Darkest tone (950)**  
The two ends of the lightness ladder. Move them to make a ramp that never goes fully pale, or one that stops short of near-black.

**Chroma amount**  
Scales the whole chroma envelope. Below 1 for muted, restrained palettes; above 1 to push saturation until the gamut stops you.

**Hue shift · light end · Hue shift · dark end**  
Rotates hue towards the ends of the ramp. A few degrees of warmth in the highlights and coolness in the shadows is what makes a ramp feel like it was mixed with paint rather than calculated.

Every tone is gamut-mapped after all of this: chroma is reduced by binary search at fixed lightness and hue until the colour fits in sRGB. That is why pushing chroma past a point stops changing anything — you have hit the edge of what the screen can show.

## Pulling colours from an image

**From an image** opens a full-screen workspace. Drop in a photo, a screenshot of a site, a brand board — anything with the colours you want.

The centre of the screen is a **hue × chroma plot of every pixel** in the image. Each dot is a pixel placed by hue around the circle and chroma out from the middle; the crosses are the key colours the tool has picked. This is not decoration — it is the tool you steer with.

- **Drag a marker** anywhere on the plot to move that key colour. With *Snap a dropped marker to its cluster* on, releasing it takes the mean of the pixels around the drop point rather than the raw position, so you land on a colour that is actually in the image.
- **Key colours to return** sets how many you want, from three to eight.
- **Also return the dominant neutral** adds a grey. The chroma cut-off throws greys away by design, but a design system almost always wants a neutral ramp too.
- **More settings** holds the clustering itself: how many clusters to fit before choosing, the minimum chroma and lightness worth keeping, how much to favour colourfulness over sheer area, and how far apart two hues must be to count as different colours. **Defaults** lives there too.

Each candidate appears as a card with its share of the image, its step, and a chevron for the rest of the detail. Uncheck the ones you do not want; the counter beside the panel title tracks what is left. **Generate N ramps** turns every checked colour into a full ramp on the desk.

> **Tuned** versus **Raw dominant**: raw shows the cluster centres exactly as the maths found them; tuned nudges them for hue separation and drops near-duplicates. Raw is the honest answer, tuned is usually the useful one.

The clustering is k-means++ in OKLab with a fixed seed, so the same image with the same settings always gives the same colours. Share of the image is measured against every pixel, not just the surviving ones — a 2% accent reads as 2%.

## Reading ramps out of Figma

**From Figma** asks for a file link and then scans **every** variable collection in it. Nothing about your naming is assumed — the tool does not go looking for a collection called Primitives, it reads what is there.

What comes back is a tree: collection, then groups, then tones, with a checkbox on every branch and every leaf. Tick a whole group to bring in a ramp. Tick a single colour to seed a new ramp from it — you will be asked for a name, since one variable is not a ramp yet.

Imported ramps arrive with the file's own colours as the truth: the tool works out which tone is the key colour, generates a ramp from it, and keeps every tone the generator would not have produced as a hand edit. Import then re-export a ramp this tool made, and you get zero overrides.

### The Figma mark

An imported ramp carries a small Figma glyph beside its name, in the list and in the title. That mark is not cosmetic: it means the tool still holds the **id of every variable** the ramp came from, along with the file, the collection, the group and the mode. Those ids are what make writing back possible.

The name matches Figma exactly, on purpose. If you rename the ramp, the old name stays visible under the new one — `was Colours/blue` — and a green dot appears beside it in the list, where there is no room for the full path.

A ramp that came in as a single key colour has no set of eleven ids behind it, so it behaves like a ramp you built by hand. It keeps the Figma mark for provenance, but cannot be overwritten in place.

## Editing one tone

Click any tone in the ramp to open **Edit tone**. The panel splits in two: the original on the left, your edit on the right. Clicking the original resets the edit; **Save ramp** commits it, **Discard edits** throws it away.

You have three ways to change the colour, and they are the same colour seen three ways:

- the **picker**, for when you have a hex from somewhere else;
- **L, C and H sliders**, for moving one property while the other two hold still;
- **Make this a key colour**, which pins the tone and rebuilds the rest of the ramp around it.

That last one is the important distinction. A plain edit is an **override**: that one tone is forced to a value and the rest of the ramp ignores it. Pinning it as a key colour makes it part of the ramp's definition, and everything around it moves. Use an override to fix a single stubborn tone; pin a key colour when the whole ramp is heading the wrong way.

## Working with the curves

**Perceptual curves · OKLCH** shows the ramp as three graphs — lightness, chroma, hue — with one point per tone. This is the fastest way to see what is wrong with a ramp, because the eye catches a kink in a line long before it catches an odd colour in a row of swatches.

### Reading them

**Lightness**  
Should fall smoothly from 50 to 950. A flat stretch means two tones that will read as the same colour in a UI. A cliff means a jump users will notice — often right where a border meets a fill.

**Chroma**  
Normally a hump: low at the pale end, peaking somewhere around 500–600, falling again into the darks. A chroma line that is clipped flat at the top is telling you the gamut ran out — those tones are as saturated as sRGB allows, and pushing further changes nothing.

**Hue**  
Usually near-flat, bending a few degrees at the ends if you set a hue shift. A sudden swing in the middle almost always means two key colours with genuinely different hues, and the ramp is travelling between them.

### Dragging a point

Drag any point up or down. The colour updates as you move — the swatches above change under your hand, not after you let go. Pinned key colours are drawn differently and hold their value; they are the anchors the rest bends around.

Two buttons appear next to the section title as soon as you touch a curve: **Save ramp** and **Discard edits**. Nothing is committed until you press one. Dragging a curve does not open the tone editor — the two ways of working stay out of each other's way.

> A practical order that works: get the lightness line smooth first, because it decides legibility. Then shape chroma for the feel you want. Touch hue last, and sparingly — a couple of degrees is a lot.

## Contrast and accessibility

Every tone reports its contrast against white and against black, as a WCAG 2.1 ratio. The thresholds worth remembering: **4.5:1** is AA for body text, **3:1** is AA for large text and for interface graphics like icons and input borders, and **7:1** is AAA.

The **Tone-against-tone matrix** checks every tone against every other tone in the same ramp. This answers the question that actually comes up in practice — *can I put my 700 text on my 100 background?* — which the white-and-black columns cannot.

On the **Export ramps** screen the **Overlay** dropdown writes a number into every cell of the grid: hex, WCAG on white, WCAG on black, or the raw L, C and H. Switching it to *WCAG on white* across all your ramps is the quickest audit there is — you see at a glance which step is the first safe one for text in every hue.

## Interface preview

The **Interface preview** tab builds a small interface — buttons, cards, form fields, states — entirely out of the selected ramp. Numbers tell you a ramp is legal; this tells you whether it is pleasant. A ramp can pass every contrast check and still feel muddy in use, and this is where that shows up.

## Saving and loading

**Save work** asks for a name and downloads a snapshot: every ramp, its key colours, its shape settings, its hand edits, and the Figma provenance for anything imported. **Load** brings one back.

The file is plain readable JSON, so you can diff it, keep it in a repository, or read it when something goes wrong. It carries a **checksum** over its contents, so a file that got truncated on a copy or edited by hand is spotted when you open it. Reformatting is fine — the checksum is taken over the data, not the whitespace — but a changed value is reported, and you decide whether to load anyway.

Loading replaces everything on the desk, and says so first. Ramps that cannot be read are skipped individually rather than failing the whole file.

> The desk itself survives a reload of the page for the session, but not a closed tab. If the work matters, save it.

## Export formats

**Export ramps** shows every ramp as a grid and offers four formats:

**Figma REST API**  
The real request body for `POST /v1/files/:key/variables`. Four arrays tied together by temporary ids so the whole set lands in one atomic call. Enterprise organisations only — that endpoint is not available on other plans.

**Design tokens**  
W3C DTCG format. What Tokens Studio and Style Dictionary consume, and the most portable thing here.

**JSON**  
Plain nested objects. For your own scripts.

**CSS hex**  
Custom properties, one per tone.

All four follow the collection and group you chose in the write panel, so what you copy matches what would be written.

## Writing into a Figma file

The panel at the bottom of the export screen writes variables straight into a file, in three steps.

### 1 · Connect and check

Paste a file link and press **Connect**. The tool opens the file, proves it can actually create a variable — by making one and removing it immediately, which is the only honest test — and reads every collection with its modes.

### Where to write

Then you choose the address:

- **Collection** — any collection in the file, or *New collection…* with a name of your own.
- **Group** — optional. Leave it empty and ramps sit at the root of the collection as `Blue/500`. Nesting works: `Core/Colours`.
- **Mode** — only appears when the collection has more than one, so you cannot flood a dark theme with light values by accident.

A line underneath shows exactly what a variable will be called and how many ramps already sit at that address. If ramps on the desk came from this file, the address is pre-filled from where they came from.

### 2 · What will be written

One row per ramp, each with a tag saying what will happen: **New**, **Update**, **Renamed**, **Updated in place**. Unticked rows go pale, drop all their controls and carry a single **Will be skipped** tag.

A warm **9 in file** marker appears when the group in Figma does not hold exactly eleven variables. Hover it to see how many will be created and how many sit outside the 50…950 scale.

### Name conflicts

If a ramp's name is already in use at that address, a dialog opens with four choices per ramp: update the existing values, rename yours, rename the one in Figma, or skip it. The explanation under the dropdown changes with the choice, and a name field appears for the two renames.

### 3 · Write

Ramps are written one call per ramp, so a failure can be pinned to a single ramp rather than leaving you guessing. Afterwards everything is **read back out of the file and compared** — names, values, ids — and the result says how many matched. Anything that went differently but did not fail is reported too.

## Overwriting in place

This is the feature the rest of the tool exists to serve. Read it once even if you skip everything else.

### The problem it solves

You are rebranding. A Figma file holds a colour system, and hundreds of layers point at those variables — fills, strokes, effects. Other variables alias them. Other files consume them through the published library. The new palette is ready.

Write it as a new set of variables and you have created a second colour system next to the first. Nothing in the file repaints. Every layer still points at the old variables, and someone has to walk through the file relinking them by hand. That is days of work, and it is the kind of work that gets nine tenths done and then quietly abandoned.

### What it does instead

Tick **Overwrite ramp in Figma** on a row and that ramp is written onto the very variables it was read from, addressed by **id** rather than by name.

A variable id in Figma survives both a rename and a value change. So when the colour underneath changes, everything that already points at that id keeps pointing at it:

- fills, strokes and effects on layers — they repaint on their own, immediately;
- aliases from other variables — semantic tokens like `surface/raised` pointing at `Colours/grey/100` keep resolving;
- the published key other files use — library consumers pick the change up on update, with no relinking.

Nothing needs to be relinked because nothing was ever unlinked. That is the whole trick, and it is why the tool goes to the trouble of remembering ids at import.

### Renaming while overwriting

You can rename the ramp too. A rename keeps the same ids, so the links hold exactly as before — `Colours/blue/500` becomes `Colours/lavander/500`, and every layer using it carries on without noticing.

> A group in Figma is only a prefix in a variable's name, not a container. So anything in that group which is **not** part of the ramp — a stray `colours/blue/base`, say — does not travel with the rename. It stays behind under the old prefix with its old colour. The tool never deletes it and always tells you it happened.

### When the group is not eleven variables

Real files are untidy. A group might hold nine variables, or twelve, or use a 1–12 scale from another system.

- **Fewer than eleven** — the ones that were imported are overwritten, and the missing tones are created alongside them. You end up with a complete ramp and the existing links intact.
- **More than eleven** — the eleven the ramp holds are overwritten; the extras are left exactly as they are, still carrying the old colours. They are listed by name in the result.

Either way you get a full 50…950 ramp without breaking a single link, and the leftovers can be tidied on the semantic layer afterwards. That is a far smaller job than relinking a file.

### When it is offered — and when it is not

The switch is only available when overwriting can actually work. Otherwise it is greyed out and explains itself:

- **Different file** — the ramp was read from another file, and ids are meaningless outside the file that issued them.
- **Grew from a single colour** — there is no set of eleven variables to write onto.
- **No file connected** — connect one first.

It is off by default. Overwriting variables in a shared file is not something to do by accident.

### Getting back

There is no undo inside this tool. Once values are written, the old colours are gone from the file. **Figma's own undo** is the way back, in the Figma window, straight after the write.

Before a real reskin: duplicate the file, or work on a branch. Then a bad result costs a click rather than an afternoon.

## The warnings before a write

Pressing the write button opens **Before writing** whenever there is something worth knowing. Each ramp with something to say gets a card, and each consequence gets a plain sentence and a label:

**Overwrites in place**  
Ids stay, links hold, but the old colours are gone.

**Renames variables**  
From the old Figma name to the new one.

**Completes the scale**  
Fewer tones were imported than the ramp has; the rest will be created.

**Leaves extras behind**  
Variables outside the 50…950 scale, untouched and still old.

**Writes a duplicate**  
The ramp came from this file but Overwrite is off, so nothing in the file will repaint. Usually a sign you meant to tick the box.

**Uneven set in the file · Renames the existing ramp**  
For ramps written by name rather than by id.

Every card has a checkbox. Drop a doubtful ramp from the write right there — the totals and the button update as you go, and the list behind the dialog follows. If there is nothing to warn about, the write simply runs.

## Two common jobs

### Reskinning an existing file

1. Duplicate the Figma file, or open a branch.
2. **From Figma** → paste the link → tick the groups that make up the current system → import.
3. Reshape each ramp: new key colours, or the curves, or both.
4. **Export ramps** → connect the same file. The address is pre-filled from where the ramps came from.
5. Tick **Overwrite ramp in Figma** on every ramp you want to land on its originals.
6. Read the warnings, then write. Check the file — layers should already be repainted.

### A new system from a brand image

1. **From an image** → drop the brand board in.
2. Set how many key colours you want; drag markers on the plot until the crosses sit on the colours you recognise.
3. Leave *Also return the dominant neutral* on — you will want a grey ramp.
4. **Generate N ramps**, then check the contrast matrix on each and fix what fails.
5. **Save work**, then export or write to Figma.

## When something is wrong

**Chroma will not go any higher**  
You are at the sRGB gamut edge. The curve is flat there because the colour does not exist on screen.

**A new group appeared in Figma instead of the old one changing**  
Overwrite was off for that ramp, or the connected file is not the file it was imported from.

**The write panel says it cannot reach Figma**  
Check three things, in order. The Cowork session must be running **On my computer** — it asks where to run a task before it starts, and a cloud session has no route to a server on your own machine. The Figma **desktop** app must be open with its MCP server enabled. The Figma connector must be authorised in Claude. Copy or Download still give you the full payload meanwhile.

**An imported ramp has hand edits everywhere**  
Expected. The file's colours are kept exactly, and anything the generator would not have produced is preserved as an override. Pin a different key colour to bring it back under the generator's control.

**The snapshot says it changed since it was saved**  
The checksum does not match the contents. Loading is still allowed — what you get is whatever the file actually says.

## Where the maths comes from

- Björn Ottosson, *A perceptual color space for image processing* — the OKLab transforms used throughout.
- Stripe, *Designing accessible color systems* — the case for building ramps on a perceptual lightness axis.
- WCAG 2.1 — the contrast ratio definition behind every number the tool reports.
- W3C Design Tokens Community Group format — the shape of the token export.
