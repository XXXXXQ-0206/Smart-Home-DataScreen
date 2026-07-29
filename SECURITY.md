# Security Policy

## Supported Versions

Only the latest `main` branch and the most recent tagged release receive security fixes.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately through the repository's GitHub Security Advisories page. Do not open a public issue for credentials, authentication bypasses, data exposure, or exploitable request handling. Include a concise description, affected commit or version, reproduction steps that use synthetic data, and the impact you observed.

Do not include real tokens, cookies, personal data, or production API responses in a report. We will acknowledge valid reports and coordinate a fix and disclosure timeline.

## Security Expectations

The dashboard is a browser client. Deploy it behind HTTPS, use least-privilege API credentials, configure a trusted origin, and never place long-lived secrets in frontend code or static assets.
