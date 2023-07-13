# Faust Playground

Faust playground is a Web platform designed to enable children to learn basic audio programming in a simple and graphic way. In particular, it allows them to develop musical instruments for Android smartphones.

## Useful links

- [https://faustplayground.grame.fr](https://faustplayground.grame.fr): official FaustPlayground website
- [https://github.com/grame-cncm/faustplayground](https://github.com/grame-cncm/faustplayground): GitHub repository

## Development

### Notes
This project uses [Vite](https://vitejs.dev/) for development mode and builds and [FaustWasm](https://github.com/Fr0stbyteR/faustwasm) for compiling Faust in the browser.

### Setup
Clone and enter the repository, then run:
```bash
npm install
```

### Run in development mode (automatic reloading)
```bash
npm run dev
```
Then press <kbd>o</kbd> to open in a browser.

### Build
``` shell
npm run build
```
Generates output in `dist/`. To view locally, run
``` shell
cd dist
python -m http.server
```

### To create examples (in `public/json/`)
- create a patch in the platform
- possibly rename it using the the "Edit" button
- save it (regular or precompiled version) using the "Save" button
- rename it with a `.json` file extension

### To add new Faust modules
In `public/faust-modules/`, add your .dsp files to `effects/` or `generators/`. Then update `index.json` to include the paths to your new modules.
