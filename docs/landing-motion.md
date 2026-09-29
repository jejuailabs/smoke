# Landing motion scenes

Implemented on 2026-09-29.

- Product scene between the solution and interactive simulator: a sticky viewport with a rotating dashboard, separated hypothesis / experiment / decision cards, growing sample bars and three scroll chapters.
- Signal scene between the simulator and workspace: generated optical-glass background, zoom, animated signal paths, orbit lines and floating metric chips.
- React client component uses passive scroll events, requestAnimationFrame and IntersectionObserver. It updates CSS transforms directly without rerendering React on each frame.
- Offscreen continuous animations pause. Motion controls and skip links are included. Reduced-motion preferences switch scenes to static normal-flow layouts.
- No Three.js dependency. Motion uses JavaScript, CSS 3D transforms and SVG paths.
- All visual metrics are illustrative sample data.

## Image provenance

Mode: built-in image generation.

Original: public/landing/signal-glass.png

Web asset: public/landing/signal-glass.webp (1672 × 941, 69,584 bytes; WebP quality 85).

Final generation prompt:

Use case: stylized-concept. Asset type: wide cinematic backdrop for an animated SaaS product landing page. Primary request: a premium product-launch-film still visualizing signals converging into clarity. Scene: near-black midnight navy infinite studio, a single sculptural translucent optical glass torus at center-right, with a few elegant fine luminous lime and pale violet light trails converging through its aperture. Materials: optical glass, subtle brushed titanium inner rim, exquisite caustics, restrained volumetric haze, photographic realism, high-end 3D render. Composition: wide landscape 16:9, generous dark negative space at left and edges for HTML typography, ring entirely visible, dramatic macro product photography, minimal intentional composition. Lighting: precise white rim lights, pale periwinkle reflections and subtle electric lime illumination. No text, no numbers, no UI, no logos, no watermarks, no busy starfield. This will be slowly zoomed and parallaxed behind an actual interactive dashboard; keep the backdrop quiet and luxurious.

## Verification

Production build and TypeScript completed successfully. ESLint now reports no errors or warnings.

Windows Computer Use initially could not determine the browser URL. Subsequent Playwright tests ran successfully in a separate headless Chrome profile at 1440px and 390px widths. Screenshots exposed a mobile dashboard alignment issue, which was fixed and visually rechecked. Tests cover scroll progress, pause, skip links, simulator controls, reduced motion and login navigation. Screenshots are saved under the ignored test-results directory when running npm run test:browser.

The real Firebase configuration endpoint responds successfully and authorizes localhost. The real Google sign-in page opens successfully. Completing Google authentication and writing to live Firestore with a user account remain unverified; signed-in UI persistence tests use isolated browser fixtures, not cloud data.
