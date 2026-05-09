# Krahnie Artifacts

Version-controlled home for Krahnie/Hermes generated artifacts: vision sites, HTML write-ups, cron reports, comics, audio, and reference docs.

This repo exists so artifacts created on the Linode can be pulled onto a laptop or any other device:

```bash
gh repo clone tjonestj3/krahnie-artifacts
# or
git clone https://github.com/tjonestj3/krahnie-artifacts.git
```

## Layout

```text
artifacts/
  html-sites/       Multi-page/static HTML artifacts and generated sites
  reports/          One-page HTML/markdown report outputs
  comics/           Generated comics and visual narratives
  media/            Audio/video/image media artifacts
  docs/             Durable reference write-ups and architecture notes
scripts/
  sync_artifacts.sh Copy known Hermes output locations into this repo
```

## Current Artifact Sources

The sync script currently pulls from:

```text
~/.hermes/hermes-agent/outputs/
~/.hermes/hermes-agent/comic/
~/agent-krahn-sdk-build/docs/system-wiki/14-krahnie-process-orchestrator.md
```

## Updating

On the Linode:

```bash
cd ~/krahnie-artifacts
./scripts/sync_artifacts.sh
```

Then pull from another machine:

```bash
cd krahnie-artifacts
git pull
```

## Notes

This repo is private by default because generated artifacts may include personal, client-process, or early creative material.
