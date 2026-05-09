---
title: Krahnie as Process Orchestrator
slug: krahnie-process-orchestrator
group: Operating Model
order: 14
---

# Krahnie as the Krahnborn Process Orchestrator

Captured: 2026-05-09

## One-line idea

Krahnie should not merely be an agent that “does work.” Krahnie should be the orchestration layer that makes Krahnborn’s client-work process easy, consistent, auditable, and hard to skip.

> No work without a card. No code without a branch. No branch without a PR. No merge without validation. No delivery without documentation.

## Why this matters

The goal is to get developers, admins, consultants, and leadership following one standard delivery motion without relying on everyone to remember the process manually.

Instead of telling people, “Please follow the workflow,” Krahnborn makes the agent-assisted workflow the easiest path:

```text
Human has client request
  → asks Krahnie
  → Krahnie creates/updates the card
  → Krahnie identifies missing info
  → Krahnie routes the work
  → Krahnie prepares the execution lane
  → human or agent does the work
  → Krahnie checks the PR/deploy/docs loop
```

The agent becomes the guardrail and coordinator, not just the implementer.

## Target lifecycle

```text
Client request
  → intake/card created
  → estimate, due date, owner, priority assigned
  → triage
  → client/repo/org routing
  → work identification
  → execution lane prepared
  → work done in developer box/worktree
  → feature branch off main
  → commits to feature branch
  → PR opened
  → human/code review
  → merge to partial branch
  → GitHub Actions deploys changed metadata to connected partial sandbox
  → validation/UAT
  → functional documentation
  → technical documentation
  → feedback/lessons captured
  → request completed
```

## Operating model

### 1. Intake

A messy Slack/Discord/client request becomes a structured card.

Example raw request:

```text
Client says partner users cannot finish onboarding.
```

Krahnie turns it into:

```yaml
client: NRI
request_type: bug
priority: needs_confirmation
owner: unassigned
requested_by: <slack-user>
due_date: needs_confirmation
summary: Partner users cannot complete onboarding
blockers:
  - Is this happening in production or only sandbox?
  - Which partner profile, permission set, or persona is impacted?
  - Is this blocking go-live or normal operations?
```

### 2. Triage

Krahnie clarifies:

- what is being requested
- who is impacted
- whether this is bug/enhancement/config/data/security/deployment work
- what “done” means
- which facts are missing
- whether the work is blocked until a human answers

### 3. Router

Krahnie maps the request to:

- client
- repository
- Salesforce org/dev hub/sandbox strategy
- relevant Slack/thread/card context
- likely responsible role or team

### 4. Work Identifier

Krahnie identifies the likely scope before anyone starts editing.

It should capture:

- work classification
- impacted metadata/code
- permission implications
- likely tests
- deployment notes
- rollback considerations
- estimate/complexity
- suggested assignee/skillset

Example:

```yaml
work_classification: salesforce_flow_permission_bug
metadata_candidates:
  - flows/Partner_Onboarding.flow-meta.xml
  - permissionsetgroups/Partner_Onboarding_PSG.permissionsetgroup-meta.xml
  - permissionsets/Partner_User.permissionset-meta.xml
testing:
  - validate partner user onboarding path in partial sandbox
  - confirm expected access with affected persona
risk: medium
```

### 5. Execution lane

The work should happen in an isolated lane, ideally one request per branch/worktree.

Recommended shape:

```text
/srv/krahnborn/clients/<client>/main
/srv/krahnborn/worktrees/<client>/<request-id>/
```

Branch examples:

```text
feature/KB-1042-partner-onboarding-validation
bugfix/KB-1043-account-trigger-null-check
config/KB-1044-case-routing-permissions
```

Worktrees provide local file isolation. Branches and PRs provide version-control isolation. Locks/approval gates should still protect shared environments like partial sandboxes and production-adjacent deploys.

### 6. Implementation

Implementation may be done by:

- an agent
- a human developer
- a human admin with agent assistance
- a mixed human+agent workflow

Krahnie’s job is to make sure the implementation still follows the same lane:

```text
card → branch/worktree → commit → PR → CI/CD → documentation
```

For admins, Krahnie can help bridge Salesforce UI work back into Git by retrieving changed metadata, creating commits, and opening PRs.

### 7. PR and review

Every implementation should produce a PR with a consistent template:

```md
## Summary

## Request
KB-1042

## Client
NRI

## Changes

## Testing

## Deployment Notes

## Rollback Notes

## Documentation
- Functional:
- Technical:
```

Krahnie can help enforce that the PR includes:

- request/card link
- summary of business impact
- metadata/code changed
- validation steps
- CI/CD status
- deployment target
- rollback notes

### 8. Partial sandbox deployment

The intended process is:

```text
feature branch
  → PR
  → merge to partial branch
  → GitHub Actions deploys changed metadata to connected partial sandbox
```

GitHub workflows handle the deployment mechanics. Krahnie’s role is to track state, surface failures, and make sure the card/PR/docs reflect the deployment result.

### 9. Documentation

Every completed request should leave both functional and technical documentation.

Functional documentation answers:

```text
What changed for the business/user?
How does the new behavior work?
How should client users/admins use it?
```

Technical documentation answers:

```text
What metadata/code changed?
What architecture or dependency changed?
What permissions/personas are impacted?
What tests were run?
What deployment notes matter?
What is the rollback plan?
```

## Feedback loop

A lightweight feedback loop should exist at the end, but it should not become noisy.

Suggested completion prompt:

```text
KB-1042 complete and documented:
Functional doc: <link>
Technical doc: <link>

Optional feedback:
- `correction: ...` to fix this request/doc
- `lesson: ...` to remember for this client in future
- `process: ...` to improve the Krahnborn workflow
```

Feedback should be classified before being saved.

### Feedback types

#### Request-specific correction

Only affects the current card/docs.

Example:

```text
correction: the due date is Friday, not next week
```

Action: update the card/docs; do not save as global knowledge.

#### Client-specific lesson

Applies to future work for a client.

Example:

```text
lesson: for NRI, partner onboarding access is controlled by permission set groups, not raw permission sets
```

Action: save to the client knowledge base, e.g. `vault/clients/nri/_index.md`.

#### Process improvement

Applies to Krahnborn workflow.

Example:

```text
process: every permission change should include affected persona and rollback notes
```

Action: update the process template, pipeline skill, or documentation checklist.

#### Agent critique

Useful for later evaluation but not always a durable rule.

Example:

```text
feedback: Krahnie overestimated this as medium; it was a small admin config change
```

Action: log and aggregate; only promote to a rule if repeated.

## Agent roles

Krahnie can stay as one user-facing agent while internally delegating to specialist roles.

### Intake Krahnie

Creates cards, extracts required fields, asks missing business questions.

### Router Krahnie

Maps requests to client, repo, org, Dev Hub, team, and environment.

### Work Identifier Krahnie

Finds likely impacted metadata/code, estimates complexity, and turns business asks into technical scope.

### Builder Krahnie

Implements changes when agent execution is appropriate.

### Reviewer Krahnie

Reviews PR completeness, risk, tests, deployment notes, and Salesforce metadata sanity.

### Documentation Krahnie

Writes functional and technical records after merge/deploy.

### PM Krahnie

Keeps cards updated, watches blockers, nudges assignees, and reports status.

## Identity and isolation

For team usage, Slack identity should map to Krahnborn identity.

Example mapping:

```yaml
slack_users:
  U123:
    name: Alice
    email: alice@krahnborn.com
    github: alice-krahn
    role: consultant
    allowed_clients:
      - nri
      - acme
```

This supports attribution, permissions, approvals, notifications, and audit trails.

Linux users are optional. The more important isolation unit is the request/worktree/branch, not the employee’s shell account.

## Concurrency rules

Multiple people can talk to Krahnie, but execution should be lane-based.

Recommended rule:

> Chat anywhere. Execute in a lane.

Use shared channels for intake, discussion, summaries, and planning. Use request threads/cards/pipelines for real implementation.

Concurrency layers:

```text
Git worktree = local file isolation
Feature branch = version-control isolation
PR = review boundary
CI/CD = deployment automation
Repo/client lock = shared-environment protection
Approval gate = business safety
```

No lock is usually needed for read-only work, planning, docs, or independent branches. Locks are recommended for shared sandboxes, deploys, migrations, merges, production-like operations, and anything that mutates shared infrastructure.

## Adoption principle

Krahnie should make the right workflow easier than skipping it.

If the easiest path for a dev/admin/consultant is:

```text
@Krahnie help with this client request
```

…and Krahnie automatically creates the card, asks the right questions, creates the branch/worktree, opens the PR, checks CI/CD, and drafts the docs, then the process becomes self-reinforcing.

## Summary

Krahnie is the operating-system layer for Krahnborn client work:

- normalizes intake
- enforces the delivery lifecycle
- routes and scopes requests
- prepares isolated work lanes
- supports both humans and agents doing implementation
- pushes everything through Git/PR/CI/CD
- captures technical and functional documentation
- learns from structured feedback

The vision is not “agents replace employees.”

The vision is:

> Agents make the standard Krahnborn process easier to follow than ignore.
