// Max upload size. With client-direct-to-Blob uploads the 4.5 MB serverless body
// limit no longer applies, so we can accept genuinely large Markdown files.
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_UPLOAD_LABEL = "25 MB";

// Content types we accept for Markdown source files. Browsers are inconsistent
// about Markdown, so we allow text/* and the generic octet-stream fallback.
export const ALLOWED_CONTENT_TYPES = [
  "text/markdown",
  "text/x-markdown",
  "text/plain",
  "application/octet-stream",
];
