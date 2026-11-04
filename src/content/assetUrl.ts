/** URL of a content file inside public/ (`AssetPath`), for any `base` (D15). */
export function assetUrl(path: string): string {
  return import.meta.env.BASE_URL + path
}
