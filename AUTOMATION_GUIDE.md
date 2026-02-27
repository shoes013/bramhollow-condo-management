# Bramhollow Condominium Association
## Automation System Guide

**Last Updated:** January 10, 2026

---

## Overview

The Bramhollow Automation System provides automated task management for routine administrative functions. This system helps managers and administrators streamline operations while ensuring compliance with New Jersey Condominium Act requirements.

---

## Automation Categories

### 1. Notices (Blue)
Automated generation of statutory and regulatory notices.

| Task | Schedule | Description |
|------|----------|-------------|
| **Meeting Notice Generator (48-Hour)** | Daily at 9:00 AM | Automatically generates 48-hour meeting notices per N.J.S.A. 46:8B-12 |
| **Recurring Meeting Generator** | Monthly on 1st | Creates monthly board meeting events 60 days in advance |
| **Budget Meeting Notice (30-Day)** | Triggered by event | Generates 30-day budget meeting notices per N.J.S.A. 46:8B-14 |

### 2. Reminders (Purple)
Event and deadline reminders for members and staff.

| Task | Schedule | Description |
|------|----------|-------------|
| **Event Reminder (24-Hour)** | Daily at 10:00 AM | Sends reminder notices 24 hours before scheduled events |
| **Event Reminder (1-Hour)** | Hourly | Sends final reminder 1 hour before events with Zoom links |
| **Quarterly Newsletter Reminder** | Quarterly | Reminds administrators to prepare quarterly newsletters |

### 3. Maintenance (Orange)
Service request management and escalation.

| Task | Schedule | Description |
|------|----------|-------------|
| **Service Request Escalation** | Daily at 8:00 AM | Escalates pending requests older than 7 days to high priority |
| **Service Request Follow-up** | Weekly on Monday | Generates follow-up for in-progress requests older than 14 days |

### 4. Compliance (Green)
Document and regulatory compliance monitoring.

| Task | Schedule | Description |
|------|----------|-------------|
| **Document Expiration Alert** | Weekly on Monday | Alerts when documents (insurance, contracts) expire within 30 days |

### 5. Cleanup (Gray)
System maintenance and data management.

| Task | Schedule | Description |
|------|----------|-------------|
| **Expired Announcement Cleanup** | Daily at 1:00 AM | Archives announcements past their expiration date |

---

## Accessing the Automation Dashboard

1. Log in to the Bramhollow Community Portal
2. Navigate to the **Admin** tab (managers and administrators only)
3. Click the **Automation** tab within the Admin panel

---

## Dashboard Features

### Overview Section
- View all automation tasks with their current status
- Toggle tasks on/off with the switch control
- Run individual tasks manually with the "Run" button
- Run all tasks at once with "Run All Tasks" button

### Statistics Cards
- **Total Tasks**: Number of configured automation tasks
- **Active Tasks**: Number of currently enabled tasks
- **Successful Runs**: Count of successful task executions
- **Failed Runs**: Count of failed task executions

### Category Tabs
Filter tasks by category to focus on specific automation areas:
- Notices
- Reminders
- Maintenance
- Compliance

### Activity Log
View recent automation activity including:
- Task name and execution time
- Status (success, failed, skipped)
- Number of items processed
- Detailed message about the execution

---

## Running Automation Tasks

### Manual Execution

**Run a Single Task:**
1. Go to the Automation Dashboard
2. Find the task you want to run
3. Click the **"Run"** button next to the task
4. Check the Activity Log for results

**Run All Tasks:**
1. Click **"Run All Tasks"** at the top of the dashboard
2. All enabled tasks will execute in sequence
3. Review the Activity Log for results

### Automatic Execution
Tasks run automatically according to their configured schedules. The system checks and executes tasks based on:
- Daily tasks: Run once per day at the specified time
- Hourly tasks: Run every hour
- Weekly tasks: Run once per week on the specified day
- Monthly tasks: Run once per month on the specified day
- Quarterly tasks: Run four times per year

---

## Task Configuration

### Enabling/Disabling Tasks

1. Navigate to the Automation Dashboard
2. Find the task you want to configure
3. Use the **switch toggle** to enable or disable the task
4. Disabled tasks will not run automatically

### Task Details

Each task displays:
- **Name**: Task identifier
- **Description**: What the task does
- **Schedule**: When the task runs automatically
- **Last Run**: Timestamp of most recent execution
- **Status**: Enabled or Disabled

---

## NJ Statutory Compliance Automations

### 48-Hour Meeting Notice (N.J.S.A. 46:8B-12)
This automation ensures compliance with New Jersey's open meeting requirements:
- Monitors upcoming board meetings
- Generates notices 48-72 hours before meetings
- Includes meeting details, location, and Zoom access information
- Posts notices as high-priority announcements

### 30-Day Budget Notice (N.J.S.A. 46:8B-14)
For budget consideration meetings:
- Triggers when budget meetings are scheduled
- Generates notices 30 days in advance
- Includes budget highlights and meeting details

### Document Retention Alerts
Monitors documents for expiration:
- Insurance certificates
- Service contracts
- Annual certifications

---

## Automation Outputs

### Generated Announcements
Meeting notices and alerts are automatically created as announcements with:
- High priority designation
- Automatic publication
- Statutory reference citations
- Complete meeting details

### Activity Logs
All automation runs are logged with:
- Timestamp of execution
- Success/failure status
- Number of items processed
- Detailed messages

---

## Troubleshooting

### Task Not Running
1. Verify the task is **enabled** (switch is on)
2. Check the Activity Log for error messages
3. Ensure the system has the required data (events, documents, etc.)

### Incorrect Output
1. Review the task description for expected behavior
2. Check if required data exists in the system
3. Run the task manually to see immediate results

### Activity Log Empty
Tasks only log activity when they run. To populate the log:
1. Click "Run All Tasks" to execute all automations
2. Individual task runs also create log entries

---

## Best Practices

1. **Review logs weekly** - Check the Activity Log for any failed tasks
2. **Keep tasks enabled** - Disable only if specific reasons require it
3. **Run manually after changes** - After updating events or documents, run related tasks
4. **Monitor compliance tasks** - Pay special attention to NJ statutory compliance automations

---

## Support

For issues with the automation system:
1. Check this guide for troubleshooting steps
2. Review the Activity Log for error details
3. Contact system administrator for technical issues

---

*This guide is part of the Bramhollow Condominium Association Help Documentation.*
*For additional help, see HELP_INDEX.md*
