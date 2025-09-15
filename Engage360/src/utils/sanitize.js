// Simple sanitization to prevent XSS
export function sanitize(input) {
  if (typeof input !== "string") return input
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()
}
