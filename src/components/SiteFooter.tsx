import Link from "next/link";
import { MotionPreferences } from "./MotionPreferences";

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-inner"><div><Link href="/" className="wordmark">Wordplay.</Link><p>Your thinking. Your progress. On this device.</p></div><div className="footer-links"><Link href="/intro">Replay intro</Link><Link href="/about">About & privacy</Link><Link href="/references">References</Link><MotionPreferences /></div></div><div className="footer-giant" aria-hidden="true">{"Wordplay".split("").map((letter, index) => <span key={index} data-field="">{letter}</span>)}<span data-field="" className="footer-dot">.</span></div></footer>;
}
