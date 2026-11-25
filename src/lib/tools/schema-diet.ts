export interface SchemaDietOptions {
  stripDescriptions: boolean;
  stripTitles: boolean;
  stripDrafts: boolean;
  pruneOptional: boolean;
  condenseEnums: boolean;
}

export interface SchemaDietResult {
  valid: boolean;
  optimizedSchema: string;
  originalTokens: number;
  optimizedTokens: number;
  percentSaved: number;
}

export interface DemoSchemaPreset {
  id: string;
  name: string;
  category: string;
  rawJson: string;
}

export const DEMO_SCHEMA_PRESETS: DemoSchemaPreset[] = [
  {
    id: "github-mcp",
    name: "GitHub MCP: create_issue",
    category: "Developer Tools",
    rawJson: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "CreateIssueParameters",
        description:
          "This tool allows the agent to create a brand new GitHub issue within a target organization and repository. Please ensure valid OAuth write permissions before dispatching.",
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "The GitHub account owner or organization login name.",
          },
          repo: {
            type: "string",
            description: "The repository slug without the .git extension.",
          },
          title: {
            type: "string",
            description: "Short issue headline for triage.",
          },
          body: {
            type: "string",
            description: "Full Markdown body with reproduction details and traces.",
          },
          labels: {
            type: "array",
            description: "Optional taxonomy tags applied on creation.",
            items: {
              type: "string",
              enum: ["bug", "enhancement", "documentation", "security", "performance", "triage", "urgent"],
            },
          },
        },
        required: ["owner", "repo", "title"],
      },
      null,
      2
    ),
  },
  {
    id: "postgres-mcp",
    name: "Postgres MCP: execute_sql",
    category: "Database",
    rawJson: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "ExecuteSqlParameters",
        description: "Runs a parameterized SQL query against the scoped tenant PostgreSQL cluster.",
        type: "object",
        properties: {
          sql: {
            type: "string",
            description: "Read-only SELECT query or bounded parameterized statement.",
          },
          timeoutMs: {
            type: "integer",
            description: "Optional execution timeout budget in milliseconds.",
          },
          format: {
            type: "string",
            description: "Output serialization format.",
            enum: ["json", "csv", "markdown", "compact", "ndjson", "table"],
          },
        },
        required: ["sql"],
      },
      null,
      2
    ),
  },
];

/** Compute compacted MCP JSON schema & approximate LLM token savings. */
export function optimizeToolSchema(
  rawJson: string,
  options: SchemaDietOptions
): SchemaDietResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return {
      valid: false,
      optimizedSchema: "// Invalid JSON Schema format. Please check syntax.",
      originalTokens: 0,
      optimizedTokens: 0,
      percentSaved: 0,
    };
  }

  const origStr = JSON.stringify(parsed, null, 2);
  const origTok = Math.ceil(origStr.length / 3.8);

  const cleanObject = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map(cleanObject);
    }
    if (typeof node !== "object" || node === null) {
      return node;
    }

    const record = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(record)) {
      if (options.stripDrafts && (k === "$schema" || k === "$id")) continue;
      if (options.stripTitles && k === "title") continue;
      if (options.stripDescriptions && k === "description") continue;

      if (options.pruneOptional && k === "properties" && typeof v === "object" && v !== null) {
        const req = Array.isArray(record.required) ? record.required : [];
        const prunedProps: Record<string, unknown> = {};
        for (const [propKey, propVal] of Object.entries(v as Record<string, unknown>)) {
          if (req.includes(propKey)) {
            prunedProps[propKey] = cleanObject(propVal);
          }
        }
        out[k] = prunedProps;
        continue;
      }

      if (options.condenseEnums && k === "enum" && Array.isArray(v) && v.length > 5) {
        out[k] = [...v.slice(0, 3), `+${v.length - 3} more`];
        continue;
      }

      out[k] = cleanObject(v);
    }
    return out;
  };

  const optimizedObj = cleanObject(parsed);
  const optStr = JSON.stringify(optimizedObj, null, 2);
  const optTok = Math.ceil(optStr.length / 3.8);
  const saved = Math.max(0, origTok - optTok);
  const pct = origTok > 0 ? Math.round((saved / origTok) * 100) : 0;

  return {
    valid: true,
    optimizedSchema: optStr,
    originalTokens: origTok,
    optimizedTokens: optTok,
    percentSaved: pct,
  };
}
