import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SPM Package";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ namespace: string; name: string }>;
}) {
  const { namespace, name } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            S
          </div>
          <span style={{ color: "#94a3b8", fontSize: "24px", fontWeight: 600 }}>
            spm.dev
          </span>
        </div>

        {/* Package name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ color: "#64748b", fontSize: "28px" }}>
            {namespace}/
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            {name}
          </span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              padding: "8px 20px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#a5b4fc",
              fontSize: "18px",
              fontWeight: 500,
            }}
          >
            Skills Package Manager
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
