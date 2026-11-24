# GeoTiff Client for Terracotta

Using OpenLayers, Vite, TypeScript, Vue 3, Pinia

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

```sh
npm install
npm start
```

## Server

The Terracotta tile server this client talks to lives next to this repository:

```sh
../geotiff_server
```

Start it before the client (see its README for setup). In development the
client points at `http://localhost:5000`; production uses
`https://unli.xyz/webmap/` (see `src/config.ts`).
