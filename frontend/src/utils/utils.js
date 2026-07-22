export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/\//g, "-")
    .replace(/\?/g, "")
    .replace(/[^\w -]+/g, "")
    .replace(/\s+/g, "-");
};
