import {
  ArrowDown,
  Check,
  Globe2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { Setup } from "@/components/setup";
import { Mascot } from "@/components/mascot";
import Link from "next/link";
import { Experience } from "@/components/experience";
export default function Home() {
  return (
    <Experience>
      <div className="home">
        <section className="hero">
          <div className="hero-copy">
            <div className="pill">
              <span className="status-dot" /> NEPALI ROOTS. SUSPICIOUS FRIENDS.
            </div>
            <h1>
              Sathi ho ki
              <br />
              <span>imposter?</span>
              <span className="title-star">✳</span>
            </h1>
            <p>
              Euta secret word. Dherai innocent faces.
              <br />
              Timro group ko sabai bhanda thulo guffadi ko ho?
            </p>
            <div className="hero-actions">
              <a href="#setup" className="primary">
                La, khelum! <ArrowDown size={18} />
              </a>
              <Link href="/rules" className="secondary">
                How to play <span>↗</span>
              </Link>
            </div>
            <div className="hero-proof">
              <span className="avatars">
                <i>S</i>
                <i>A</i>
                <i>B</i>
                <i>?</i>
              </span>
              <div>
                <strong>Good friends. Great liars.</strong>
                <span>3–20 players · Ages 6+ · Unlimited drama</span>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-label">
              <span className="status-dot" /> TRUST NO ONE. EXCEPT THE VIBES.
            </div>
            <span className="speech speech-left">Ma ta innocent ho!</span>
            <span className="speech speech-right">…sure ho?</span>
            <Mascot />
            <div className="art-bottom">
              <span className="art-rule" />
              <span>EVERY GROUP HAS ONE.</span>
              <span className="art-rule" />
            </div>
            <span className="art-spark">✳</span>
            <span className="art-index">01 / SUSPECT FILES</span>
          </div>
        </section>
        <div className="benefit-strip">
          <span>
            <Smartphone size={17} />
            <strong>One phone. Whole gang.</strong>
          </span>
          <span>
            <Globe2 size={17} />
            Nepali words, global fun
          </span>
          <span>
            <ShieldCheck size={17} />
            Free to play, always
          </span>
          <span>
            <Check size={17} />
            Works offline
          </span>
        </div>
        <Setup />
        <section className="how-strip">
          <div>
            <span className="eyebrow">SMALL RULES. BIG SUSPICIONS.</span>
            <h2>Teen steps. Full drama.</h2>
            <Link href="/rules">
              Get the whole story <span>↗</span>
            </Link>
          </div>
          <article>
            <span className="step-number">01</span>
            <Smartphone />
            <h3>Hera. Lukau. Pass gara.</h3>
            <p>
              Check your secret card. Everyone knows the word. Well, almost
              everyone.
            </p>
          </article>
          <article>
            <span className="step-number">02</span>
            <Users />
            <h3>Clue deu. Guff hana.</h3>
            <p>
              Give one subtle clue. The imposter has to blend in. Listen for the
              bluff.
            </p>
          </article>
          <article>
            <span className="step-number">03</span>
            <Sparkles />
            <h3>Shanka gara. Vote gara.</h3>
            <p>
              Point out the imposter. Or watch your most innocent friend fool
              everyone.
            </p>
          </article>
        </section>
        <div className="nepal-note">
          <span>LOCALLY FLAVOURED. ENDLESSLY REPLAYABLE.</span>
          <p>Momo dekhi Machhapuchhre samma.</p>
          <Link href="/library">
            Explore the word library <span>↗</span>
          </Link>
        </div>
      </div>
    </Experience>
  );
}
