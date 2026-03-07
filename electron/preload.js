// electron/preload.js
window.electronAPI = {
  // Example: you can expose safe APIs for your renderer
  ping: () => console.log("pong")
};