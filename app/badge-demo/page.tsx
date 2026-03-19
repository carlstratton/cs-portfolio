import { BadgeDemoClient } from "./BadgeDemoClient";

export default function BadgeDemoPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#1a1a1a",
      }}
    >
      <BadgeDemoClient />
    </div>
  );
}
