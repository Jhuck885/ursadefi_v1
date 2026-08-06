# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` branch | Yes |
| Tagged releases | Best effort until 1.0 |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report privately to the repository owner (GitHub security advisory on this repo, or the contact listed on the owner’s GitHub profile).

Include:

- Description of the issue
- Steps to reproduce
- Impact (e.g. auth bypass, key leakage, fee diversion)
- Your contact for follow-up

We will acknowledge reports as soon as practical and work on a fix before any public disclosure.

## Scope notes

UrsaDeFi is **non-custodial**. User private keys are expected to remain in Xaman. Issues involving:

- Exposure of XUMM API secrets in client bundles
- Ability for the app to sign without user approval
- Diversion of platform fees to an attacker-controlled address via config injection

are high priority.

Issues that require the user to deliberately paste a seed into the browser are generally out of scope (user error), but we still welcome UX hardening suggestions.

## Configuration

Operators must set `PLATFORM_FEE_RECEIVER` themselves. A public receive address is not a spending key, but misconfiguration can send fees to the wrong account.
