# KDS — Helping companies from external attack

Business website for a cybersecurity services practice: external penetration testing (VAPT), private bug bounty / vulnerability disclosure program setup and management, and compliance readiness (SOC 2, HIPAA, PCI DSS, CMMC/NIST 800-171).

## Site

Static site — `index.html`, `styles.css`, `script.js`. No build step, no dependencies. Deployed with GitHub Pages.

## Sections

- **Services** — offensive security testing, VDP/bug bounty programs, compliance & incident readiness
- **Pillars** — the three focus pillars (Offense, Programs, Readiness) plus differentiators
- **Process** — Discover → Scope → Test → Report → Retest
- **Track Record** — accomplishments to date
- **Pricing** — starting prices per service
- **Contact** — scope request

## Local preview

```bash
cd ~/workspace/business-site
python3 -m http.server 8000
# open http://localhost:8000
```
