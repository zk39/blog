---
course_code: "IT 7000"
course_name: "Systems Analytics and Enterprise Management"
title: "Designing an Internal IT Support Ticketing System: Requirements, Architecture Decision Matrix, and Prototype"
description: "Systems analysis for an internal IT helpdesk ticketing system — requirements definition, a weighted decision matrix comparing three architecture alternatives, and a working front-end prototype"
date: 2024/09/22
learning_outcome: "Apply systems analysis techniques — requirements elicitation, alternative evaluation, and structured decision-making — to design enterprise information systems that align with organizational needs."
status: "complete"
category: "it"
---

**Designing an Internal IT Support Ticketing System**

*Kun Zhang*<br>
Ottawa University · IT 7000: Systems Analytics and Enterprise Management<br>
Week 4 Assignment — Alternative Decision Matrix

---

## Problem Statement

Most mid-size organizations still route IT support requests through email or chat, which gives staff no reliable queue, no priority signal, and no audit trail. The Week 4 deliverable for this course was a Software Design Specification (SDS) for an internal IT support ticketing system, followed by a structured evaluation of the architecture alternatives available to implement it. This essay summarizes the requirements the system had to satisfy, walks through the weighted decision matrix used to choose between three candidate architectures, and links to a working front-end prototype of the resulting ticket submission flow.

## Requirements Baseline

The SDS defined the following functional and non-functional requirements, which also became the evaluation criteria in the decision matrix below:

- **FR-01** — Standardized ticket submission with required diagnostic fields (requester, category, priority, subject, description).
- **FR-02 / NFR-03** — Centralized ticket queue that supports concurrent access from multiple technicians.
- **FR-03** — Dynamic priority-tier assignment, adjustable by IT staff after intake.
- **FR-05** — Automated status-update notifications back to the requester.
- **FR-06** — Data consistency and reporting support for queue metrics.
- **NFR-01 / NFR-02** — Browser-based access with no client install, and a codebase the existing team can maintain.
- **NFR-04** — Role-based access control for technicians versus requesters.
- **NFR-05** — Support for phased, incremental adoption rather than a big-bang rollout.

## Alternatives Considered

Three architectures were scored against that baseline:

- **Alternative A — Three-tier + relational database.** The architecture originally proposed in the SDS: a browser client, a stateless application server, and a relational database holding tickets, users, and status history.
- **Alternative B — Monolithic + relational database.** Same relational schema, but client and server logic are bundled into a single deployable unit to reduce operational overhead.
- **Alternative C — Microservices + document (NoSQL) database.** The workload is split into independent services (intake, queueing, notifications), each backed by its own document store.

## Weighted Decision Matrix

Each criterion was weighted by business importance (weights sum to 1.0) and scored 0–10 per alternative; weighted score = points × weight.

<div style="overflow-x:auto; margin: 24px 0;">
<table style="width:100%; border-collapse:collapse; font-size:0.86rem; min-width:640px;">
<thead>
<tr>
<th style="text-align:left; padding:10px 12px; background:var(--bg-secondary); border-bottom:2px solid var(--border); font-weight:600;">Criterion</th>
<th style="text-align:center; padding:10px 12px; background:var(--bg-secondary); border-bottom:2px solid var(--border); font-weight:600;">Weight</th>
<th style="text-align:center; padding:10px 12px; background:var(--bg-secondary); border-bottom:2px solid var(--border); font-weight:600;">A — Three-tier</th>
<th style="text-align:center; padding:10px 12px; background:var(--bg-secondary); border-bottom:2px solid var(--border); font-weight:600;">B — Monolith</th>
<th style="text-align:center; padding:10px 12px; background:var(--bg-secondary); border-bottom:2px solid var(--border); font-weight:600;">C — Microservices</th>
</tr>
</thead>
<tbody>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Standardized submission with diagnostic fields (FR-01)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.10</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.90</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.70</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.70</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Centralized queue, concurrent access (FR-02, NFR-03)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.12</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">1.08</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.72</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.96</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Dynamic priority-tier assignment (FR-03)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.10</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.90</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.60</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.80</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Automated status-update notifications (FR-05)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.05</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.40</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.30</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.35</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Development cost / implementation difficulty</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.08</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.56</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.64</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.32</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Scalability for future growth</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.08</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.56</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.32</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.72</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Security and role-based access control (NFR-04)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.10</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.80</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.60</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.50</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Browser compatibility, no client install (NFR-01, NFR-02)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.10</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.90</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.80</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.80</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Data consistency and reporting support (FR-06)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.05</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.45</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.40</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.25</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Maintainability, team familiarity (NFR-02)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.10</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.80</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.60</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.40</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Phased / incremental adoption support (NFR-05)</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.05</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.40</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.25</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.45</td></tr>
<tr><td style="padding:9px 12px; border-bottom:1px solid var(--border);">Overall alignment with prioritized requirements</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.07</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.63</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.42</td><td style="text-align:center; padding:9px 12px; border-bottom:1px solid var(--border);">0.35</td></tr>
<tr style="font-weight:700;"><td style="padding:10px 12px; border-top:2px solid var(--border);">TOTAL</td><td style="text-align:center; padding:10px 12px; border-top:2px solid var(--border);">1.00</td><td style="text-align:center; padding:10px 12px; border-top:2px solid var(--border); color:var(--accent);">8.38</td><td style="text-align:center; padding:10px 12px; border-top:2px solid var(--border);">6.35</td><td style="text-align:center; padding:10px 12px; border-top:2px solid var(--border);">6.60</td></tr>
</tbody>
</table>
</div>

## Result and Rationale

**Alternative A (three-tier, relational database)** won with a weighted score of **8.38 / 10**, ahead of Microservices + NoSQL (6.60) and the Monolith (6.35). The relational schema scored highest on exactly the criteria carrying the most weight: concurrent queue access (0.12), standardized intake fields, priority handling, security, browser compatibility, and maintainability (each 0.10). A ticketing system is fundamentally relational — tickets, users, and status history reference one another and need consistent, transactional updates — so a relational store fit the domain better than splitting state across independent document stores. Alternative C scored better on raw scalability and phased adoption, but it loses on development cost and on maintainability, since the team has no existing microservices experience. Alternative B is cheaper to build but caps future scalability and concurrent-access support, which are core to the requirements. The three-tier architecture was therefore carried forward into implementation.

## Prototype: Ticket Submission Flow

To make the SDS tangible, the client tier of Alternative A was built out as a working front-end prototype: a ticket submission form implementing FR-01 (required diagnostic fields), FR-03 (an editable priority selector), and a live preview panel that mirrors the data a technician would see land in the queue (FR-02). Submitting the form generates a ticket ID, stores a local record of the request, and hands off to a confirmation screen where the ticket can be downloaded as a backup file — a simple stand-in for the automated notification in FR-05.

It's a static, client-side demo built for this course rather than a connected backend, but it reproduces the intake experience the SDS describes end to end.

<p style="margin: 32px 0 8px;">
<a href="/emba/ticket.html" style="display:inline-flex; align-items:center; gap:8px; background:var(--accent); color:#fff; padding:13px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:0.95rem;">Try the ticket submission prototype →</a>
</p>
