# Values awaiting a real source

Every numeric claim that would need a literature or evaluation citation is listed here. Until verified, store `placeholder: true` and `verified: false`, and show a PLACEHOLDER tag in API/UI.

## Error-rate literature priors (`fixtures/error_rates_seed.yaml`)

- **wallet_cio**: Verify precision/recall and citation against the original published evaluation. Seeded as P=0.36, R=0.44 because that is what the source report listed. The source report also stated F1=0.27, which is inconsistent with these P/R (generated F1 ≈ 0.40). Do not store F1 (D4).
- **infra_multi_signal**: PLACEHOLDER precision/recall and citation. Not a measured property of this deployment.
- **stylometry**: PLACEHOLDER precision/recall and citation. Dataset, language, and era will differ from this system (D5).
- **handle_exact**: PLACEHOLDER precision/recall; collisions are expected (D7).
- **pgp_fingerprint**: PLACEHOLDER precision/recall for exact-match false-positive rate in the intended domain.

## Persona / obfuscation thresholds (`config/thresholds.yaml`)

These are operational gates, not calibrated detectors (D9). Marked PLACEHOLDER until a labelled corpus justifies them:

- `persona.mixed_script_token_ratio_threshold`
- `persona.confusable_substitution_rate_threshold`
- `persona.entropy_flattening_zscore_threshold`
- `persona.style_shift_delta_threshold`

## Infra

- `infra.prevalence_max` default 5 is an operational cutoff, not a published false-lead rate. The false-lead **estimate** must come only from `local_validation.per_comparison_fp_rate` (D22). Until a validation run exists, show `not_yet_measured`.

## Identity

- `identity.cluster_max` default 500 is an operational cap against mega-clusters, not a literature constant.

## Not statistics (do not invent)

- Per-comparison false-positive rate: measure on seeded negatives in the validation harness; never invent.
- False-lead expected count: `comparisons * per_comparison_fp_rate` only after that measurement exists.
- Dashboard “confidence” as a probability: forbidden. Bands summarise strongest evidence tier only.
