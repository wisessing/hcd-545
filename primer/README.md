# HCD-545 primer project

The Lab 1 scene with a playground file, for **Primer: three.js and WebXR**. It runs with the same tools as the labs.

1. In VS Code, **File > Open Folder** and choose this folder (the one with `package.json`).
2. Open a terminal (**Terminal > New Terminal**) and run `npm ci`, then `npm run dev`.
3. Open the **Local** URL it prints (`https://localhost:5173/`) in Chrome or Edge and accept the certificate warning.
4. Edit `src/try.js` or `src/my-scene.js` and save: the page reloads.

Use it on the laptop. For the phone, use your published lab page: copy your changes in `src/my-scene.js` into `src/my-scene.js` in the newest lab folder of your `hcd545-webxr` repository (`lab2` after Lab 2 Task 1, otherwise `lab1`), then commit and push. Copying the whole file replaces the version there. Keep this folder outside `hcd545-webxr`.

What is different from the Lab 1 project:

- `index.html` links `src/style.css`.
- `src/main.js` loads `src/try.js` through `src/playground.js`, starts with the Capabilities panel closed, and skips the Start card.
- `src/my-scene.js` is the same file as in Lab 1, so you can copy it either way.

The sofa and car are from the Khronos glTF Sample Assets (CC BY 4.0); see `public/models/CREDITS.md`.
