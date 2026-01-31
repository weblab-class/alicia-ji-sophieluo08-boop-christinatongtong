# 🎨 Palette

Palette is a fast-paced cognitive game that trains **focus, visual memory, and recall** through color-based challenges.

Players engage in multiple game modes, including **grid memorization** and **drawable color regions**. In each mode, colors are shown briefly and must be accurately reproduced after they disappear. Difficulty increases through larger layouts, tighter time limits, and more subtle color distinctions.

In today's online world, addictive doomscrolling shortens our attention spans with brainrot, but Palette is an addictive game that aims to strengthen your attention, also with some brainrot.

---

### Game Modes
- **Grid Mode**: Memorize and recreate a color grid under time pressure
- **Drawing Mode**: Recall and color free-form regions with the correct colors

---

## Third-Party Libraries and APIs

This project uses the following third-party libraries and APIs:

### Frontend Libraries
- **React** (^18.2.0) - UI library - https://react.dev/
- **React DOM** (^18.2.0) - React rendering - https://react.dev/
- **React Router** (^5.3.4) - Client-side routing - https://reactrouter.com/
- **React Router DOM** (^6.0.0) - Browser routing for React Router - https://reactrouter.com/
- **@react-oauth/google** (^0.12.1) - Google OAuth integration for React - https://www.npmjs.com/package/@react-oauth/google
- **jwt-decode** (^3.1.2) - JWT token decoding - https://www.npmjs.com/package/jwt-decode
- **socket.io-client** (^4.8.1) - Real-time client library - https://socket.io/
- **core-js** (^3.8.1) - JavaScript standard library polyfills - https://github.com/zloirock/core-js
- **url-loader** (^4.1.1) - Asset loader for webpack - https://www.npmjs.com/package/url-loader

### Backend Libraries
- **Express** (^4.17.1) - Web framework for Node.js - https://expressjs.com/
- **Express Session** (^1.17.1) - Session middleware for Express - https://www.npmjs.com/package/express-session
- **Mongoose** (^7.8.3) - MongoDB object modeling for Node.js - https://mongoosejs.com/
- **Socket.io** (^4.8.1) - Real-time bidirectional event-based communication - https://socket.io/
- **google-auth-library** (^6.1.3) - Google authentication library for Node.js - https://github.com/googleapis/google-auth-library-nodejs
- **connect-ensure-login** (^0.1.1) - Authentication middleware for Express - https://www.npmjs.com/package/connect-ensure-login
- **dotenv** (^16.0.3) - Environment variable loader - https://www.npmjs.com/package/dotenv

### Build Tools & Development Dependencies
- **Vite** (^6.0.0) - Next generation frontend tooling - https://vitejs.dev/
- **@vitejs/plugin-react-swc** (^3.0.0) - Vite plugin for React with SWC - https://github.com/vitejs/vite-plugin-react-swc
- **vite-plugin-svgr** (^4.5.0) - SVG support for Vite - https://github.com/pd4d10/vite-plugin-svgr
- **nodemon** (^3.1.9) - Development server with auto-restart - https://nodemon.io/

### External APIs & Services
- **Google OAuth API** - User authentication service - https://developers.google.com/identity/protocols/oauth2
  - Used via `@react-oauth/google` (frontend) and `google-auth-library` (backend)
- **Google Fonts** - Web font service - https://fonts.google.com/
  - **Roboto** font - https://fonts.google.com/specimen/Roboto


### Custom Fonts
- **CS Bodega** (csbodega.otf) - Craft Supply Co - https://www.fontspace.com/cs-bodega-font-f147388
  - Used for main title and page headings

### Database
- **MongoDB** - NoSQL database - https://www.mongodb.com/
  - Accessed via MongoDB Atlas cloud service - https://www.mongodb.com/cloud/atlas

### Assets & Media
- **SVG Drawings** (public/drawings/)
  - apple.svg - https://www.freepik.com/free-vector/outline-style-apple_148852686.htm#fromView=keyword&page=40&position=0&uuid=f5a1eef3-b1d1-4bd9-83f9-94ec85bf4596&query=Outline+berry (Modified)
  - bear.svg - https://svgcollections.com/design/adorable-bear-outline-svg-2/ (Modified)
  - pug.svg - https://stock.adobe.com/search?k=dog+with+glasses+silhouette&asset_id=1652276422 (Modfied)
  - snake.svg - https://www.freepik.com/free-vector/hand-drawn-flat-design-snake-outline_22340381.htm#fromView=keyword&page=1&position=0&uuid=7a4fb980-0902-49f1-8bf4-367b64b0617f&query=Cute+baby+animals+line+art+snake (Modified)
  - cake.svg - https://www.svgrepo.com/svg/482193/whole-cake-1 (Modified)
  - udon.svg - https://www.svgrepo.com/svg/482333/udon-4 (Modified)
  - icecream.svg - https://www.svgrepo.com/svg/482290/soft-serve-5 (Modified)
  - butterfly.svg - https://www.svgrepo.com/svg/422941/garden-butterfly-insect (Modified)
  - fish.svg - https://www.svgrepo.com/svg/289130/fish (Modified)

- **Icons & Images** (public/)
  - paint-brush.png - https://www.flaticon.com/free-icon/paint-brush_103414?term=paint+brush&page=1&position=7&origin=tag&related_id=103414
  - paint_bucket.png - https://www.shareicon.net/color-pail-fill-painting-bucket-colour-696104
  - six_seven.gif - https://giphy.com/explore/67s
  - edit-pen.png - https://www.flaticon.com/free-icon/edit_7398464
  - gold.png, silver.png, & bronze.png - https://designbundles.net/cooshstore/1191358-coin-game-medal-with-the-star-icon-gold-silver-and


All dependencies are listed in `package.json` and can be installed via `npm install`.
