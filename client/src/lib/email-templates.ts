export interface EmailTemplate {
  name: string;
  description: string;
  category: "association" | "general";
  defaultContent: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    name: "Community Update",
    description: "Monthly community newsletter for all residents",
    category: "association",
    defaultContent: `# Bramhollow Community Update

## [Month] [Year] Newsletter

Dear Bramhollow Residents,

Welcome to this month's community update. Here is a summary of what's happening in our community.

---

### Board Update

The Board of Directors met on [date]. Key decisions included:

- [Decision 1]
- [Decision 2]
- [Decision 3]

Minutes from this meeting are available on the Bramhollow management portal under the Documents tab.

### Maintenance & Property

- **Completed:** [Describe completed maintenance work]
- **In Progress:** [Describe ongoing work]
- **Upcoming:** [Describe planned work]

### Reminders

- Monthly common charges of $[amount] are due on the 1st of each month
- Quiet hours are observed from 10:00 PM to 8:00 AM daily
- Guest parking passes are available through the management portal
- Service requests can be submitted online at any time

### Upcoming Events

| Date | Event | Location |
|------|-------|----------|
| [Date] | [Event Name] | [Location] |
| [Date] | [Event Name] | [Location] |

---

### Contact Information

**Property Management:** [Name/Company]
**Emergency Maintenance:** [Phone Number]
**Board Email:** board@bramhollow.org

---

*Bramhollow Condominium Association Inc*
*Statutory Compliance: N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Board Meeting Recap",
    description: "Summary of board meeting decisions and actions",
    category: "association",
    defaultContent: `# Board of Directors Meeting Recap

## Meeting Date: [Date]
## Location: [Location / Virtual via Zoom]

---

### Attendance

**Board Members Present:** [Names]
**Board Members Absent:** [Names]
**Owners in Attendance:** [Number]

---

### Agenda Items & Decisions

#### 1. Approval of Prior Meeting Minutes
The minutes from the [Date] meeting were reviewed and approved.

#### 2. Financial Report
- Operating account balance: $[Amount]
- Reserve account balance: $[Amount]
- Delinquent accounts: [Number] units totaling $[Amount]
- All expenditures were within budget for the current period.

#### 3. Property & Maintenance Report
- **Completed Work:** [Description]
- **Pending Requests:** [Number] open service requests
- **Upcoming Projects:** [Description]

#### 4. Old Business
- [Item 1]: [Status/Decision]
- [Item 2]: [Status/Decision]

#### 5. New Business
- [Item 1]: [Discussion summary and any motion/vote]
- [Item 2]: [Discussion summary and any motion/vote]

#### 6. Owner Comments
[Summary of any owner questions or comments raised during the open forum]

---

### Action Items

| Action | Assigned To | Due Date |
|--------|------------|----------|
| [Task] | [Person] | [Date] |
| [Task] | [Person] | [Date] |

### Next Meeting
**Date:** [Date]
**Time:** [Time]
**Location:** [Location]

*Notice: Per N.J.S.A. 46:8B-12, written notice of all board meetings is provided at least 48 hours in advance.*

---

*Bramhollow Condominium Association Inc*
*Statutory Compliance: N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Seasonal Maintenance",
    description: "Seasonal maintenance schedule and preparation tips",
    category: "association",
    defaultContent: `# Seasonal Maintenance Update

## [Season] [Year] — Preparing Our Community

---

### Scheduled Maintenance

The following maintenance activities are planned for the coming weeks:

#### Exterior & Grounds
- [Task 1] — Estimated completion: [Date]
- [Task 2] — Estimated completion: [Date]
- [Task 3] — Estimated completion: [Date]

#### Building Systems
- [HVAC/Plumbing/Electrical task] — Scheduled: [Date]
- [Inspection type] — Scheduled: [Date]

#### Parking Lot
- [Seal-coating/striping/repairs] — Scheduled: [Date]
- Per the Second Amendment to the Master Deed, parking areas are maintained as limited common elements

### What Residents Should Know

**During maintenance work:**
- Vehicles may need to be temporarily relocated from specific areas
- There may be brief interruptions to [water/electricity/access]
- Advance notice will be posted at least 48 hours before any disruption

### Resident Preparation Checklist

- [ ] Ensure your unit's [heating/cooling] system is serviced
- [ ] Check smoke detectors and replace batteries
- [ ] Clear balconies and patios of loose items before [season] weather
- [ ] Report any maintenance concerns through the service request portal
- [ ] Confirm your emergency contact information is current with management

### Snow Removal Procedures *(Winter Only)*

The Association maintains a seasonal snow removal contract covering:
- Parking lots and driveways
- Sidewalks and common walkways
- Salt and sand application
- Emergency plowing for storms exceeding [X] inches

**Resident responsibility:** Each unit owner is responsible for clearing their individual entrance and steps.

---

### Submit a Service Request

If you notice any maintenance issues, please submit a service request through the Bramhollow management portal. All requests are tracked and prioritized.

---

*Bramhollow Condominium Association Inc*
*Statutory Compliance: N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Compliance Update",
    description: "Statutory compliance progress and legal updates",
    category: "association",
    defaultContent: `# Compliance Update — Our Reset

## Bringing Bramhollow Into Full Statutory Compliance

### N.J.S.A. 46:8B-1 et seq. — Progress Report

---

### Overview

As part of our ongoing commitment to transparency and compliance with the New Jersey Condominium Act, this update provides a summary of recent actions taken by the Association to meet statutory requirements.

### Completed Actions

- [x] **[Action 1]** — [Brief description of what was done and which statute it addresses]
- [x] **[Action 2]** — [Brief description]
- [x] **[Action 3]** — [Brief description]

### In Progress

- [ ] **[Action 4]** — Expected completion: [Date]
- [ ] **[Action 5]** — Expected completion: [Date]

### Upcoming

- [ ] **[Action 6]** — Planned start: [Date]
- [ ] **[Action 7]** — Planned start: [Date]

---

### Key Statutory References

| Requirement | Statute | Status |
|-------------|---------|--------|
| Annual Budget Adoption | Article VIII, By-Laws | [Status] |
| 48-Hour Meeting Notice | N.J.S.A. 46:8B-12 | [Status] |
| Reserve Fund Maintenance | N.J.S.A. 46:8B-14(g) | [Status] |
| Board Training | N.J.S.A. 46:8B-14.4 | [Status] |
| Document Access | N.J.S.A. 46:8B-14 | [Status] |
| ADR Availability | NJ DCA Regulations | [Status] |

### Owner Rights Reminder

Every unit owner has the right to:
- Inspect association financial records and governing documents
- Receive a proper budget before assessments are collected
- Vote in board elections
- Receive 48-hour advance notice of board meetings
- Access Alternative Dispute Resolution through the NJ DCA

---

### Questions or Concerns?

If you have questions about any compliance action, please contact the Board or submit an inquiry through the management portal.

---

*Bramhollow Condominium Association Inc*
*"Our Reset" — Statutory Compliance with N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Event Announcement",
    description: "Community event invitations and details",
    category: "association",
    defaultContent: `# Community Event Announcement

## [Event Name]

**You're Invited!**

---

### Event Details

| | |
|---|---|
| **Date:** | [Day, Month Date, Year] |
| **Time:** | [Start Time] — [End Time] |
| **Location:** | [Location/Address] |
| **RSVP By:** | [Date] |

---

### About This Event

[Describe the event in 2-3 sentences. What will happen, why it matters to the community, and what attendees can expect.]

### What to Bring

- [Item 1]
- [Item 2]
- [Item 3 — or "Nothing! Just yourself."]

### Agenda / Schedule

| Time | Activity |
|------|----------|
| [Time] | [Activity — e.g., Welcome & Introductions] |
| [Time] | [Activity — e.g., Main Presentation] |
| [Time] | [Activity — e.g., Q&A / Open Discussion] |
| [Time] | [Activity — e.g., Wrap-up] |

---

### How to RSVP

Please RSVP through the Events tab on the Bramhollow management portal, or contact [Name] at [email/phone].

**Space is limited to [number] attendees.**

---

### Meeting Notice

Per N.J.S.A. 46:8B-12, this notice is being provided at least 48 hours in advance of the scheduled event.

---

*Bramhollow Condominium Association Inc*
*Statutory Compliance: N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Financial Report",
    description: "Quarterly or annual financial summary for owners",
    category: "association",
    defaultContent: `# Financial Report

## [Quarter/Year] — Bramhollow Condominium Association Inc

---

### Financial Summary

This report is provided to all unit owners in accordance with Article VIII of the Association By-Laws and N.J.S.A. 46:8B-14.

---

### Operating Account

| Category | Budgeted | Actual | Variance |
|----------|----------|--------|----------|
| Part-Time Manager/Superintendent | $[Amount] | $[Amount] | $[Amount] |
| Common Area Electricity & Heating | $[Amount] | $[Amount] | $[Amount] |
| Insurance | $[Amount] | $[Amount] | $[Amount] |
| Ground Maintenance | $[Amount] | $[Amount] | $[Amount] |
| Snow Removal | $[Amount] | $[Amount] | $[Amount] |
| Miscellaneous Expenses | $[Amount] | $[Amount] | $[Amount] |
| Legal & Accounting | $[Amount] | $[Amount] | $[Amount] |
| Contingency Reserve | $[Amount] | $[Amount] | $[Amount] |
| Reserve for Replacement | $[Amount] | $[Amount] | $[Amount] |
| **Total** | **$[Amount]** | **$[Amount]** | **$[Amount]** |

### Assessment Collection

- Total assessments billed: $[Amount]
- Total assessments collected: $[Amount]
- Collection rate: [X]%
- Delinquent accounts: [Number] units

### Reserve Fund Status

| Component | Target Balance | Current Balance | % Funded |
|-----------|---------------|-----------------|----------|
| Roof Replacement | $[Amount] | $[Amount] | [X]% |
| Parking Lot Resurface | $[Amount] | $[Amount] | [X]% |
| **Total Reserves** | **$[Amount]** | **$[Amount]** | **[X]%** |

### Working Capital Fund

- Opening balance: $[Amount]
- Contributions received: $[Amount]
- Expenditures: $[Amount]
- Closing balance: $[Amount]

---

### Notes

- [Any significant financial events, large expenditures, or variances to explain]
- [Status of any special assessments or pending financial obligations]

### Owner Rights

Per N.J.S.A. 46:8B-14, all unit owners have the right to inspect the Association's complete financial records. To request a review of detailed records, contact [Name/Management] at [email/phone].

---

*Bramhollow Condominium Association Inc*
*Statutory Compliance: N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Emergency Notice",
    description: "Urgent communications for time-sensitive issues",
    category: "association",
    defaultContent: `# URGENT: Emergency Notice

## Bramhollow Condominium Association

**Date Issued:** [Date and Time]

---

### Nature of Emergency

**[Brief title — e.g., Water Main Break / Power Outage / Storm Preparation]**

[Describe the situation clearly in 2-3 sentences. What happened, when it started, and what area is affected.]

---

### Immediate Actions Required

1. **[Action 1]** — [e.g., Do not use water until further notice]
2. **[Action 2]** — [e.g., Move vehicles from parking lot B]
3. **[Action 3]** — [e.g., Report any damage to your unit immediately]

### What the Association Is Doing

- [Response action 1 — e.g., Emergency repair crew dispatched]
- [Response action 2 — e.g., Insurance company has been notified]
- [Response action 3 — e.g., Temporary arrangements being made]

### Estimated Resolution

**Expected resolution:** [Date/Time or "Updates will be provided as available"]

### Emergency Contact Information

| Contact | Phone |
|---------|-------|
| Property Management | [Phone] |
| Emergency Maintenance | [Phone] |
| Local Police (non-emergency) | [Phone] |
| Local Fire Department | [Phone] |
| Utility Company | [Phone] |

---

### Updates

Updates will be posted:
- On the Bramhollow management portal
- Via email to all registered owners
- On the community notice board at [location]

**Next update expected:** [Date/Time]

---

*Bramhollow Condominium Association Inc*
*Statutory Compliance: N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Welcome Letter",
    description: "New resident welcome package and orientation",
    category: "association",
    defaultContent: `# Welcome to Bramhollow

## New Resident Information Package

---

Dear [Name],

Welcome to Bramhollow Condominium Association! We are pleased to have you as a member of our community. This letter provides essential information to help you get settled.

---

### Your Unit Information

| | |
|---|---|
| **Unit Number:** | [Unit #] |
| **Building:** | [Building/Address] |
| **Move-In Date:** | [Date] |
| **Parking Assignment:** | [Space # or N/A] |

### Monthly Assessment

Your monthly common charge is **$[Amount]**, due on the **1st of each month**.

This assessment covers: property management, common area utilities, insurance, grounds maintenance, snow removal, and reserve fund contributions.

> **Important:** Per Article VIII of the By-Laws, all assessments are based on the Non-Discretionary Annual Budget, which is available for review on the management portal.

### Working Capital Contribution

A one-time Working Capital contribution of **$[Amount]** is required per the Purchase Agreement. This fund is maintained for maintenance and repairs to Common Elements.

---

### Getting Started

1. **Register on the management portal** at [URL] to access all community information
2. **Review the governing documents** available on the Documents tab
3. **Set up your assessment payment** — contact management for payment options
4. **Submit a service request** if you notice any maintenance issues in your unit or common areas

### Important Documents

As a unit owner, you are entitled to copies of:
- Master Deed (Book 3687, Page 257, Hudson County Register)
- Certificate of Incorporation (Book 3676, Page 335)
- By-Laws
- Rules and Regulations
- Current Annual Budget

All documents are available on the Bramhollow management portal.

### Community Guidelines

- **Quiet Hours:** 10:00 PM — 8:00 AM daily
- **Guest Parking:** Available through the management portal
- **Service Requests:** Submit online for fastest response
- **Exterior Modifications:** Require Board approval before any work begins
- **Common Areas:** Shared spaces should be left clean and accessible

### Your Rights as an Owner

Under N.J.S.A. 46:8B-1 et seq., you have the right to:
- Inspect all association financial records and governing documents
- Receive 48-hour advance notice of board meetings
- Vote in board elections and on major community decisions
- Access Alternative Dispute Resolution through the NJ DCA

---

### Key Contacts

| Contact | Information |
|---------|-------------|
| Property Management | [Name] — [Phone] — [Email] |
| Emergency Maintenance | [Phone] (24/7) |
| Board of Directors | board@bramhollow.org |

---

We look forward to having you as part of the Bramhollow community.

*Bramhollow Condominium Association Inc*
*Statutory Compliance: N.J.S.A. 46:8B-1 et seq.*`
  },
  {
    name: "Blank Template",
    description: "Start with a clean slate",
    category: "general",
    defaultContent: `# Newsletter Title

Write your content here using Markdown formatting.

## Section Heading

Your content goes here. Use **bold** for emphasis and *italic* for secondary emphasis.

- Bullet point 1
- Bullet point 2
- Bullet point 3

---

*Bramhollow Condominium Association Inc*`
  }
];

export function getTemplateByName(name: string): EmailTemplate {
  return emailTemplates.find(template => template.name === name) || emailTemplates[0];
}
