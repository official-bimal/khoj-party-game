import { ArrowDown, ArrowUpRight, Users } from "lucide-react";
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
            <p className="hero-kicker" lang="ne">
              चिया सेलाउन्जेल, एक राउन्ड?
            </p>
            <h1>
              Sathi ho ki
              <br />
              <span>imposter?</span>
            </h1>
            <p className="hero-description">
              Sabailai word thaha chha. Ek jana lai chhaina.
              <br />
              Aba sathi ko kura sunera, guffadi patta lagau.
            </p>
            <div className="hero-actions">
              <a href="#setup" className="primary">
                La, khelum! <ArrowDown size={18} aria-hidden="true" />
              </a>
              <Link href="/rules" className="secondary">
                How to play <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="table-details">
              <Users size={16} aria-hidden="true" />
              <span>
                3–20 friends{" "}
                <span className="detail-divider" aria-hidden="true">
                  /
                </span>{" "}
                One phone or online
              </span>
            </div>
          </div>
          <figure className="hero-art">
            <span className="art-label">Hamrai group ko khel.</span>
            <span className="speech speech-left">Ma ta innocent ho!</span>
            <span className="speech speech-right">Ho ra?</span>
            <Mascot />
            <figcaption className="art-bottom">
              Yo smile lai chai napattau.
            </figcaption>
          </figure>
        </section>
        <Setup />
        <section className="how-to" aria-labelledby="how-heading">
          <div className="how-intro">
            <div>
              <p className="section-note">Pahilo patak ho?</p>
              <h2 id="how-heading">Ek round mai bujhinchha.</h2>
            </div>
            <Link href="/rules">
              Read the rules <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ol className="how-steps">
            <li>
              <span className="step-number" aria-hidden="true">
                01
              </span>
              <h3>Card hera, ani lukau.</h3>
              <p>
                Check your word in private, then pass the phone. The imposter
                has to work with a blank card.
              </p>
            </li>
            <li>
              <span className="step-number" aria-hidden="true">
                02
              </span>
              <h3>Palai palo clue deu.</h3>
              <p>
                Say a little, listen a lot. Give a clue that makes sense without
                giving the whole word away.
              </p>
            </li>
            <li>
              <span className="step-number" aria-hidden="true">
                03
              </span>
              <h3>Kaslai shanka lagyo?</h3>
              <p>
                Talk it out and vote. If you catch the imposter, they get one
                last chance to guess the word.
              </p>
            </li>
          </ol>
        </section>
        <div className="library-note">
          <p>
            Momo, madal, Machhapuchhre…
            <br />
            <span>
              Words you grew up with. Friends you know a little too well.
            </span>
          </p>
          <Link href="/library">
            See what’s in the word list{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Experience>
  );
}
