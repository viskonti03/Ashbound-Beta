export default function Sigil({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    shield: "M12 2L21 6V12Q21 19 12 23Q3 19 3 12V6ZM12 6V18",
    awakening: "M12 2L15 8L22 5L18 14L12 22L6 14L2 5L9 8ZM7 12L12 15L17 12",
    flame:
      "M12 2C14 9 21 10 19 17C17 24 5 23 5 16C5 11 9 9 9 6C10 11 13 12 12 2Z",
    void: "M19 4A10 10 0 1 0 20 19A9 9 0 0 1 19 4Z",
    rift: "M4 21L14 5L21 2L17 10L4 21ZM7 14L12 19M4 18L7 21",
    ruin: "M12 2L22 12L12 22L2 12Z M12 6L18 12L12 18L6 12Z",
    pulse: "M3 12H6L9 4L13 20L17 8L19 12H23",
    kinetic: "M2 12Q12 0 22 12Q12 24 2 12ZM12 8A4 4 0 1 0 12 16A4 4 0 1 0 12 8",
    burst:
      "M12 2V6M12 18V22M2 12H6M18 12H22M5 5L8 8M16 16L19 19M5 19L8 16M16 8L19 5M12 8L16 12L12 16L8 12Z",
    earth: "M2 20L9 6L14 15L17 10L23 20ZM7 10L9 12L11 10",
    lightning: "M14 2L4 14H11L9 23L21 9H13Z",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind] ?? paths.rift} />
    </svg>
  );
}
