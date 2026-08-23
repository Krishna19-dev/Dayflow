// Custom 404 page — plain, no AuthProvider/useAuth dependency
// This prevents prerender crash during `next build` on Render

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#f1f5f9",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "6rem",
              fontWeight: 700,
              margin: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: "2rem" }}>
            Page not found
          </p>
          <a
            href="/dashboard"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go to Dashboard
          </a>
        </div>
      </body>
    </html>
  );
}
