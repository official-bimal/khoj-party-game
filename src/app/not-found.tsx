import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty-state">
      <h1>This suspect went missing.</h1>
      <p>That page doesn’t exist. Your friends are waiting.</p>
      <Link href="/" className="primary">
        Back to the game →
      </Link>
    </section>
  );
}
