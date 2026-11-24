# GeoTiff Client for Terracotta

Using OpenLayers, Vite, TypeScript, Vue 3, Pinia.

```sh
                         _
                        ('>
                        /))@@@@@.
                       /@"@@@@@()@
                      .@@()@@()@@@@                         .-",
                      @@@O@@@@()@@@                         `~||
                      @()@@\@@@()@@                           ||___
                       @()@||@@@@@'                           (':.)`
                        '@@||@@@'                             || ||
                     jgs   ||                                 || ||
                    ^^^^^^^^^^^^^^^^^                         ^^ ^^
```

## Quick start

The Terracotta tile server lives next to this repository:

```sh
../geotiff_server
```

Install both projects and start them together:

```sh
make install
make dev
```

`make dev` runs the Flask/Terracotta server on `http://localhost:5000` and the
Vite client on `http://127.0.0.1:5173`. Use `make start` as an alias. Stop both
with Ctrl+C. To run them separately:

```sh
make server
make client
```

The client uses `http://localhost:5000` in development and
`https://unli.xyz/webmap` in production (see `src/config.ts`).

## Server-driven data

The client does not ship a dataset catalog. On startup it reads:

- `GET /keys` and `GET /datasets` for the available dataset keys.
- `GET /metadata/<keys>` for per-dataset ranges and percentiles.
- A single `GET /singleband/<keys>/0/0/0.png` probe to learn the server's
  default tile size.

Compute tile URLs include that tile size, so changing `DEFAULT_TILE_SIZE` in
the server configuration is reflected without a client rebuild. The color list
in `src/colormaps.ts` is the Terracotta colormap set.

## Compute layer behaviour

- The **first variable is the output raster**. It is always visible and owns the
  color stretch controls.
- Additional variables only restrict which output pixels are valid. Use
  **Include in mask** to include or exclude a variable's filter range; they do
  not replace the output raster.
- Reordering variables changes which one is the output, so the stretch range
  resets when a new output is selected.
- Filter and stretch bounds are clamped so filters cannot cross and the server
  never receives a stretch range with `max <= min`.
- The server exposes five compute operands (`v1`–`v5`), so the UI caps a layer
  at five variables.

## Split maps

The S/H/V buttons select a single map or two side-by-side/stacked maps. The two
panes share center, zoom, and rotation; panning either pane updates the other.

## Development

```sh
make test        # vitest
make typecheck   # vue-tsc --noEmit (checks .ts and .vue)
make build       # production build into dist/
```
