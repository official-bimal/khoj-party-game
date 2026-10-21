"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty-state">
      <h1>A little plot twist.</h1>
      <p>Something went wrong. Try again to return to the game.</p>
      <button onClick={reset} className="primary">
        Try again
      </button>
    </section>
  );
}
