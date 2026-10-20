import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p", "br", "strong", "em", "u", "s", "blockquote", "code", "pre",
  "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "img", "table", "thead", "tbody", "tr", "th", "td",
  "span", "div", "hr", "sub", "sup", "cite", "mark", "small",
];

const allowedAttributes = {
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height"],
  code: ["class"],
  pre: ["class"],
  span: ["class"],
  div: ["class"],
  p: ["class"],
  td: ["colspan", "rowspan", "align"],
  th: ["colspan", "rowspan", "align"],
  table: ["class"],
  ul: ["class"],
  ol: ["class"],
  li: ["class"],
  h1: ["class"], h2: ["class"], h3: ["class"], h4: ["class"], h5: ["class"], h6: ["class"],
};

const allowedSchemes = ["http", "https", "mailto", "tel"];

export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    // Disallow protocols like javascript:
    disallowedTagsMode: "discard",
    // Only allow relative URLs for images/uploads
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      }),
    },
  });
}

export function sanitizeText(text: string): string {
  // For plain-text fields (names, titles, subjects), strip all HTML
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}