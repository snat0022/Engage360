// src/utils/sanitize.js
export function sanitize(input) {
  const el = document.createElement('div')
  el.innerText = input
  return el.innerHTML
}
