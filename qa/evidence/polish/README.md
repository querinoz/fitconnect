# Polish pass evidence placeholder

Automated screenshots and test logs for the 2026-08-29 polish pass.

## To generate

```bash
npm run dev
npm run design:review
npm test 2>&1 | tee qa/evidence/polish/unit-tests.log
```

## Expected artifacts

- `design-review-*.png` — landing and marketing
- `unit-tests.log` — vitest output
- Manual: `/feed` and `/profile` screenshots after sign-in
