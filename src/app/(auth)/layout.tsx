export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell" style={{ minHeight: "100vh" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          padding: "32px 16px",
          flex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
