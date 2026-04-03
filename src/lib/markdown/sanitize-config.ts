import { defaultSchema } from "rehype-sanitize";

type Schema = typeof defaultSchema;

/**
 * Strict sanitization schema for package README content.
 *
 * Built on top of the GitHub-flavored defaults but:
 * - Strips all script/iframe/embed/object tags
 * - Removes all event handler attributes (onclick, onerror, etc.)
 * - Strips javascript: URIs from href/src
 * - Allows standard Markdown elements + code blocks
 */
export const readmeSanitizeSchema: Schema = {
  ...defaultSchema,

  // Explicitly deny dangerous tags
  tagNames: (defaultSchema.tagNames ?? []).filter(
    (tag) =>
      ![
        "script",
        "style",
        "iframe",
        "object",
        "embed",
        "form",
        "input",
        "textarea",
        "select",
        "button",
        "meta",
        "link",
        "base",
      ].includes(tag)
  ),

  attributes: {
    ...defaultSchema.attributes,
    // Allow code highlighting classes
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className", /^language-./],
      ["className", /^hljs/],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className", /^hljs-/],
    ],
    // Allow standard link attributes but NOT event handlers
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    // Table elements
    td: ["align", "valign"],
    th: ["align", "valign"],
  },

  // Strip javascript: from ALL URL attributes
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
    cite: ["http", "https"],
  },

  // Ensure rel="nofollow noopener" on links
  clobberPrefix: "readme-",
  clobber: ["name", "id"],

  // Strip ALL event handler attributes globally
  strip: ["script", "style"],
};
