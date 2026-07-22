import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0F1D",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(34,211,238,0.18), transparent 45%), radial-gradient(circle at 85% 85%, rgba(34,211,238,0.12), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 84,
              height: 84,
              borderRadius: 20,
              backgroundColor: "#111827",
              border: "2px solid rgba(34,211,238,0.35)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 46,
              color: "#22D3EE",
            }}
          >
            ⚖
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#ffffff" }}>
            Hukuk<span style={{ color: "#22D3EE" }}>im</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          Aradığınız Avukatla Dakikalar İçinde Görüşün
        </div>
      </div>
    ),
    { ...size }
  );
}
