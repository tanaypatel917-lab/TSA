import Link from "next/link";
import { MotionPreferences } from "./MotionPreferences";

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-inner"><div><Link href="/" className="wordmark">Wordplay.</Link><p>Your thinking. Your progress. On this device.</p></div><div className="footer-links"><Link href="/intro">Replay intro</Link><Link href="/about">About & privacy</Link><Link href="/references">References</Link><MotionPreferences /></div></div></footer>;
}
