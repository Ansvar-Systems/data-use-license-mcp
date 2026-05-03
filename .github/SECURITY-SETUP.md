# Repo Security Setup

This file documents the GHAS / repo settings for this MCP. Configure at repo creation time.

## Required GHAS Settings

- **Code scanning (CodeQL default setup)** — enabled.
- **Secret scanning + push protection** — enabled.
- **Private vulnerability reporting** — enabled.

## Required Repo Secrets

- `NPM_TOKEN` — Classic Automation Token for npm publish (required by `publish-npm.yml`).
- `SEMGREP_APP_TOKEN` — Semgrep SaaS managed-rules token (required by `semgrep.yml`).

## Branch Protection Rules

- `main` is the default branch and is protected.
- All PRs to `main` require status checks: `ci.yml`, `semgrep.yml`.
- Direct pushes to `main` are blocked except by admin override.

## Dependabot

Configured in `.github/dependabot.yml`. PRs reviewed weekly; auto-merge enabled for patch updates after CI passes.
