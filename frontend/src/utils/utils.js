export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/\//g, "-")
    .replace(/\?/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};