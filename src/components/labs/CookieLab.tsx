"use client";

import { useEffect, useRef, useState } from "react";
import { COOKIE_COPY, COOKIE_SITE, GETS, PARTNER_COUNT, partnerSample, morePartnersText, TRICKS } from "@/content/cookieBanner";
import { LabFrame } from "./LabFrame";

const partners = partnerSample(12);
type CookieChoice = "accept" | "reject";

export function CookieLab() {
  const [partnerListOpen, setPartnerListOpen] = useState(false);
  const [manageOptions, setManageOptions] = useState(false);
  const [choice, setChoice] = useState<CookieChoice | null>(null);
  const [enabledPartners, setEnabledPartners] = useState(() => new Set(partners.map((partner) => partner.name)));
  const resultHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (choice) resultHeading.current?.focus();
  }, [choice]);

  function openPartners(manage = false) {
    setPartnerListOpen(true);
    setManageOptions(manage);
  }

  function togglePartner(name: string) {
    setEnabledPartners((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function startAgain() {
    setPartnerListOpen(false);
    setManageOptions(false);
    setChoice(null);
    setEnabledPartners(new Set(partners.map((partner) => partner.name)));
  }

  const hoodContent = <>
    <p>These four patterns make one privacy choice feel easier than another:</p>
    <ul className="cookie-hood-list">{TRICKS.map((trick) => <li key={trick.id}><strong>{trick.label}</strong><span>{trick.text}</span></li>)}</ul>
    <p className="cookie-hood-source">Privacy regulators have warned against design tricks like these. <a href="https://www.edpb.europa.eu/documents/guideline/guidelines-032022-on-deceptive-design-patterns-in-social-media-platform_en" target="_blank" rel="noreferrer">See EDPB Guidelines 03/2022 ↗</a></p>
  </>;

  return <LabFrame
    id="cookie-lab"
    kicker="Try it"
    title={COOKIE_COPY.title}
    note={COOKIE_COPY.note}
    hood={{ spec: "Model: none · The site, banner and partners are invented · Runs on your device", content: hoodContent }}
  >
    <div className="cookie-browser">
      <div className="cookie-browser-bar">
        <span className="cookie-browser-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="cookie-browser-address">{COOKIE_SITE.address}</span>
      </div>
      <div className="cookie-study-page" aria-hidden="true">
        <div className="cookie-study-heading"><span>{COOKIE_SITE.name}</span><strong>Cell structure</strong></div>
        <div className="cookie-study-cards">
          <article><strong>Cell membrane</strong><span>Controls what enters and leaves a cell.</span></article>
          <article><strong>Mitochondria</strong><span>Releases energy from food.</span></article>
          <article><strong>Chloroplast</strong><span>Captures light for photosynthesis.</span></article>
        </div>
      </div>
      <section className="cookie-banner" role="region" aria-label="Pretend cookie banner">
        <div className="cookie-banner-heading">
          <span className="cookie-biscuit" aria-hidden="true" />
          <h4>{COOKIE_COPY.bannerTitle}</h4>
        </div>
        <p className="cookie-banner-copy">{COOKIE_COPY.bannerBody}</p>
        <button
          type="button"
          className="cookie-partner-link"
          aria-expanded={partnerListOpen}
          aria-controls="cookie-partner-list"
          onClick={() => openPartners(false)}
        >
          {choice && <span className="cookie-sticker" aria-hidden="true">3</span>}
          Show all partners ({PARTNER_COUNT})
        </button>
        {partnerListOpen && <div
          id="cookie-partner-list"
          className="cookie-partner-list"
          role="region"
          aria-label="Partner list"
          tabIndex={0}
        >
          <h5>All partner names here are made up.</h5>
          {manageOptions && <p className="cookie-manage-hint">Switch off each one you don&apos;t want.</p>}
          <ul>
            {partners.map((partner, index) => {
              const checked = enabledPartners.has(partner.name);
              return <li key={partner.name}>
                <div className="cookie-partner-details">
                  <strong>{partner.name}</strong>
                  <span>{partner.purpose}</span>
                </div>
                <div className="cookie-switch-wrap">
                  <span>Legitimate interest</span>
                  <button
                    type="button"
                    role="switch"
                    className="cookie-switch"
                    aria-label={`Legitimate interest for ${partner.name}`}
                    aria-checked={checked}
                    onClick={() => togglePartner(partner.name)}
                  >
                    <span aria-hidden="true" />
                    {index === 0 && choice && <span className="cookie-sticker" aria-hidden="true">4</span>}
                  </button>
                </div>
              </li>;
            })}
          </ul>
          <p className="cookie-more-partners">{morePartnersText(partners.length)}</p>
        </div>}
        <div className="cookie-banner-actions">
          <button type="button" className="cookie-key cookie-key--accept" onClick={() => setChoice("accept")}>
            {choice && <span className="cookie-sticker" aria-hidden="true">1</span>}
            Accept all
          </button>
          <button type="button" className="cookie-reject-link" onClick={() => setChoice("reject")}>
            {choice && <span className="cookie-sticker" aria-hidden="true">2</span>}
            Reject all
          </button>
          <button type="button" className="cookie-key cookie-key--manage" aria-expanded={partnerListOpen && manageOptions} onClick={() => openPartners(true)}>
            Manage options
          </button>
        </div>
      </section>
    </div>
    <p className="cookie-choice-status" role="status" aria-live="polite" aria-atomic="true">
      {choice ? `You chose ${choice === "accept" ? "Accept all" : "Reject all"}.` : ""}
    </p>
    {choice && <section className="cookie-result">
      <h3 className="cookie-result-heading" ref={resultHeading} tabIndex={-1}>
        {choice === "accept" ? "One click, 847 companies." : "You found the grey link."}
      </h3>
      <p className="cookie-result-copy">
        {choice === "accept" ? "You just agreed to share with every partner on the list." : "Saying no should be as easy as saying yes. Here it wasn't."}
      </p>
      <section className="cookie-result-section" aria-labelledby="cookie-tricks-title">
        <h4 id="cookie-tricks-title">Spot the tricks</h4>
        <ol className="cookie-trick-list">{TRICKS.map((trick, index) => <li key={trick.id}>
          <span className="cookie-trick-number" aria-hidden="true">{index + 1}</span>
          <div><strong>{trick.label}</strong><p>{trick.text}</p></div>
        </li>)}</ol>
      </section>
      <section className="cookie-result-section" aria-labelledby="cookie-gets-title">
        <h4 id="cookie-gets-title">What does each partner get?</h4>
        <ul className="cookie-gets-list">{GETS.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="cookie-compare" aria-labelledby="cookie-compare-title">
        <h4 id="cookie-compare-title">Compare: this site</h4>
        <p>Wordplay: 0 analytics · 0 ad partners · 0 accounts. On screens 768px and wider with motion on, the 3D scenes load from Spline (prod.spline.design) and its 3D decoder from Google (www.gstatic.com); those two servers can see your IP address and which file was requested.</p>
      </section>
      <button type="button" className="button-secondary cookie-retry" onClick={startAgain}>Try again</button>
    </section>}
  </LabFrame>;
}
