import Link from "next/link";
export const metadata = { title: "How to play" };
export default function Page() {
  return (
    <section className="content-page rules-page">
      <span className="eyebrow">
        A MINUTE TO LEARN. A FRIENDSHIP TO QUESTION.
      </span>
      <h1>
        Clues, guff, ani shanka<span className="coral">.</span>
      </h1>
      <p className="muted">
        Gather 3–20 friends. Most players know one secret word. A few imposters
        have to bluff. No signup, no referee, just a good poker face.
      </p>
      {[
        [
          "01",
          "Hera, lukau, pass gara.",
          "Each player deliberately reveals their own card, hides it, then passes the phone. Citizens see the same word. Imposters see no word, with an optional category hint.",
        ],
        [
          "02",
          "Clue deu. Dhyan diyera suna.",
          "Take turns giving a short, subtle clue. Never say the secret word. The imposter listens and tries to sound convincing. Discuss until the timer ends or the group is ready.",
        ],
        [
          "03",
          "Vote gara. Sachchai patta lagau.",
          "Pass the phone for each private vote, or vote on your own screen online. You can vote for one other player or abstain. Once submitted, a vote is locked.",
        ],
        [
          "04",
          "Caught? One last chance.",
          "Caught imposters can guess the secret word if this setting is enabled. A correct guess steals the win. Otherwise, the citizens win only if every imposter was caught.",
        ],
      ].map(([n, title, text]) => (
        <article className="rule-card" key={n}>
          <span>{n}</span>
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </article>
      ))}
      <section className="prose">
        <h2>भेटघाटलाई अझ रमाइलो बनाऊ।</h2>
        <p>
          सबैले आफ्नो कार्ड गोप्य रूपमा हेर। शब्द थाहा हुनेले सानो संकेत देऊ।
          इम्पोस्टरले थाहा भएजस्तो गर्नुपर्छ। छलफलपछि शंका लागेको साथीलाई भोट
          देऊ। कार्ड हेरेपछि फोन दिनुअघि अवश्य लुकाऊ।
        </p>
        <h2>Fair play, clear rules</h2>
        <ul>
          <li>
            A tie for the highest vote catches nobody. For multiple imposters,
            the top N suspects are caught only when there is no tie at the
            cutoff.
          </li>
          <li>
            Missing votes become abstentions after two minutes. Final guesses
            expire after one minute. Discussion moves to voting when the timer
            expires.
          </li>
          <li>
            Citizens win +100 each when every imposter is caught and nobody
            guesses correctly. A correct individual citizen vote adds +25 even
            if the citizens lose.
          </li>
          <li>
            Imposters win +150 each by surviving, or +200 each when a caught
            imposter guesses correctly. A guessed win replaces the survival
            award.
          </li>
          <li>
            Each round shuffles roles independently with secure randomness. Past
            assignments do not predict the next imposter.
          </li>
        </ul>
        <h2>Same friends. Different trouble.</h2>
        <p>
          <strong>Undercover:</strong> the odd players get a related word
          instead of a blank card. Describe your word and find who has a
          different one. The final guess is disabled; scoring is tracked by the
          round mode.
        </p>
        <p>
          <strong>Nepali Chaos:</strong> shuffled speaking order, a surprise
          prompt or shorter discussion, plus +25 for each winning imposter.
          Events never change words or roles.
        </p>
        <h2>Offline & online</h2>
        <p>
          Offline play works after the production app has been opened and cached
          once. Secret roles stay in temporary memory and a reload ends the
          local round. In online rooms, players receive only their own card
          through their private session. Use a voice call for clues. Inactive
          rooms expire after two hours; hosts can transfer control or close the
          room.
        </p>
        <h2>A friendly table</h2>
        <p>
          Keep clues kind. The default words exclude alcohol-related entries.
          Local play assumes friends respect each other’s screen; don’t inspect
          another player’s card or browser tools.
        </p>
      </section>
      <Link className="primary" href="/">
        La, khelum! →
      </Link>
    </section>
  );
}
