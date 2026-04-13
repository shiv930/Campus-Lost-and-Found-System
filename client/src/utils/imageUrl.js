/** Resolve uploaded image path for <img src /> */
export function resolveUploadUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_API_URL || "";
  return `${base}${path}`;
}
