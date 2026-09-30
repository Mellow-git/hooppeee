export function AboutPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-navy">About</h1>
      <section className="rounded-xl bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-navy">Method</h2>
        <p className="mt-2 text-slate-700">
          Three engines feed an evidence ledger: infrastructure multi-signal confirmation, wallet
          clustering with CoinJoin and service-wallet exclusions, and stylometry that reports rank,
          margin, and reference-set size. The ledger is the product. There is no fused score. A human
          analyst verifies every lead.
        </p>
      </section>
      <section className="rounded-xl bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-navy">Rules of engagement</h2>
        <p className="mt-2 text-slate-700">
          Collection is passive OSINT against public pages. The platform does not perform active
          attacks, credential stuffing, or exploitation.
        </p>
      </section>
      <section className="rounded-xl bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-navy">Bands instead of a score</h2>
        <p className="mt-2 text-slate-700">
          A scalar confidence number would imply calibration we do not have. The band is the strongest
          supporting evidence tier, downgraded to contested when an equal or stronger contradiction
          exists. Corroboration is a separate count of independent classes. Neither is a probability.
        </p>
      </section>
    </div>
  );
}
