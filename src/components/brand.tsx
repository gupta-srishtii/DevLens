import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="DevLens home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M10 7H7v7M22 7h3v7M7 21v4h7M25 21v4h-7"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2.3" />
          <path d="m20 20 4 4" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span>
          Dev<span className="text-primary">Lens</span>
        </span>
      )}
    </Link>
  );
}
