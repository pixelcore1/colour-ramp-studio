# Tests

Three jsdom suites that drive the real `figma-colour-ramps.html` — no mocks of the
tool itself, only of the world around it.

| | What it covers |
|---|---|
| `tcore.js` | Boot, ramp generation, the write panel, warnings, snapshots with checksums, help contents, footer |
| `tinplace.js` | The generated Plugin API scripts, run against a stand-in Figma: ids survive a rename, no duplicates, short groups get completed, strays are left alone |
| `tscan.js` | Paged scanning against a bridge that truncates at 20 KB, exactly like the real one |

```
npm install jsdom
node tests/tcore.js
node tests/tinplace.js
node tests/tscan.js
```

Each prints a line per check and a total. They read the HTML from
`skills/figma-colour-ramps/assets/figma-colour-ramps.html` — adjust the path at the
top of each file if you moved it.
