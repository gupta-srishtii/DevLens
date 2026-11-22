import { ImageResponse } from "next/og";

export const alt = "DevLens — See beyond the code. Public GitHub repository intelligence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#080e1a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
        color: "#e9eef8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: "#72e4dc", marginBottom: 45 }}>
        DevLens / REPOSITORY INTELLIGENCE
      </div>
      <div
        style={{
          fontSize: 94,
          letterSpacing: -5,
          lineHeight: 1.05,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span>See beyond</span>
        <span>the code.</span>
      </div>
      <div style={{ color: "#a8bad2", fontSize: 25, marginTop: 40 }}>
        Code. People. Momentum. A clearer picture.
      </div>
    </div>,
    size,
  );
}
