import Link from "next/link";
export default function Offline() {
  return (
    <section className="empty-state">
      <h1>Offline? Still on.</h1>
      <p>
        Pass-the-phone and your cached word packs work without a connection.
        Online rooms need the internet.
      </p>
      <Link href="/" className="primary">
        Play around one phone →
      </Link>
    </section>
  );
}
