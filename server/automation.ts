import { storage } from "./storage";
import type { Event, Announcement, ServiceRequest, Document } from "@shared/schema";

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  schedule: string;
  lastRun: Date | null;
  nextRun: Date | null;
  isEnabled: boolean;
  category: 'notices' | 'reminders' | 'maintenance' | 'compliance' | 'cleanup';
}

export interface AutomationLog {
  id: string;
  taskId: string;
  taskName: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: Date;
  itemsProcessed: number;
}

const automationLogs: AutomationLog[] = [];

const automationTasks: AutomationTask[] = [
  {
    id: 'meeting-notice-48hr',
    name: 'Meeting Notice Generator (48-Hour)',
    description: 'Automatically generates 48-hour meeting notices per N.J.S.A. 46:8B-12',
    schedule: 'Daily at 9:00 AM',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'notices'
  },
  {
    id: 'event-reminder-24hr',
    name: 'Event Reminder (24-Hour)',
    description: 'Sends reminder notices 24 hours before scheduled events',
    schedule: 'Daily at 10:00 AM',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'reminders'
  },
  {
    id: 'event-reminder-1hr',
    name: 'Event Reminder (1-Hour)',
    description: 'Sends final reminder 1 hour before events with Zoom links',
    schedule: 'Hourly',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'reminders'
  },
  {
    id: 'service-request-escalation',
    name: 'Service Request Escalation',
    description: 'Escalates pending service requests older than 7 days to high priority',
    schedule: 'Daily at 8:00 AM',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'maintenance'
  },
  {
    id: 'service-request-followup',
    name: 'Service Request Follow-up',
    description: 'Generates follow-up notifications for in-progress requests older than 14 days',
    schedule: 'Weekly on Monday',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'maintenance'
  },
  {
    id: 'document-expiration-alert',
    name: 'Document Expiration Alert',
    description: 'Alerts administrators when documents (insurance, contracts) are expiring within 30 days',
    schedule: 'Weekly on Monday',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'compliance'
  },
  {
    id: 'recurring-meeting-generator',
    name: 'Recurring Meeting Generator',
    description: 'Automatically creates monthly board meeting events 60 days in advance',
    schedule: 'Monthly on 1st',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'notices'
  },
  {
    id: 'newsletter-reminder',
    name: 'Quarterly Newsletter Reminder',
    description: 'Reminds administrators to prepare quarterly newsletters',
    schedule: 'Quarterly (Mar 1, Jun 1, Sep 1, Dec 1)',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'reminders'
  },
  {
    id: 'announcement-cleanup',
    name: 'Expired Announcement Cleanup',
    description: 'Archives announcements past their expiration date',
    schedule: 'Daily at 1:00 AM',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'cleanup'
  },
  {
    id: 'budget-meeting-notice',
    name: 'Budget Meeting Notice (30-Day)',
    description: 'Generates 30-day budget meeting notices per N.J.S.A. 46:8B-14',
    schedule: 'Triggered by event creation',
    lastRun: null,
    nextRun: null,
    isEnabled: true,
    category: 'compliance'
  }
];

function logAutomation(taskId: string, taskName: string, status: 'success' | 'failed' | 'skipped', message: string, itemsProcessed: number = 0): void {
  const log: AutomationLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    taskId,
    taskName,
    status,
    message,
    timestamp: new Date(),
    itemsProcessed
  };
  automationLogs.unshift(log);
  if (automationLogs.length > 100) {
    automationLogs.pop();
  }
  console.log(`[Automation] ${taskName}: ${status} - ${message}`);
}

export async function runMeetingNotice48Hr(): Promise<{ generated: number; announcements: any[] }> {
  const task = automationTasks.find(t => t.id === 'meeting-notice-48hr')!;
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  
  try {
    const events = await storage.getEvents();
    const upcomingMeetings = events.filter((event: Event) => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= in48Hours && eventDate <= in72Hours && 
             (event.title.toLowerCase().includes('meeting') || event.title.toLowerCase().includes('board'));
    });
    
    const generatedNotices: any[] = [];
    
    for (const meeting of upcomingMeetings) {
      const existingAnnouncements = await storage.getAnnouncements(true);
      const noticeExists = existingAnnouncements.some((a: Announcement) => 
        a.title.includes('48-Hour Notice') && a.content.includes(meeting.title)
      );
      
      if (!noticeExists) {
        const noticeContent = `NOTICE OF MEETING - 48-HOUR STATUTORY NOTICE

Pursuant to N.J.S.A. 46:8B-12, notice is hereby given:

**Meeting:** ${meeting.title}
**Date:** ${new Date(meeting.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Time:** ${new Date(meeting.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
**Location:** ${meeting.location || 'Community Room'}

${meeting.isVirtual && meeting.zoomLink ? `**Virtual Access:**
- Zoom Link: ${meeting.zoomLink}
- Meeting ID: ${meeting.zoomMeetingId || 'See link'}
- Passcode: ${meeting.zoomPasscode || 'See invitation'}` : ''}

${meeting.description || ''}

All unit owners are welcome to attend.

Board of Directors
Bramhollow Condominium Association Inc

---
*This notice was automatically generated per NJ statutory requirements.*`;

        const announcementData = {
          title: `48-Hour Notice: ${meeting.title}`,
          content: noticeContent,
          type: 'alert' as const,
          isPublished: true,
          authorId: 'system-admin',
          publishDate: new Date(),
          priority: 'high' as const
        };

        const savedAnnouncement = await storage.createAnnouncement(announcementData);
        generatedNotices.push(savedAnnouncement);
      }
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Generated and saved ${generatedNotices.length} meeting notices`, generatedNotices.length);
    
    return { generated: generatedNotices.length, announcements: generatedNotices };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

export async function runEventReminder24Hr(): Promise<{ sent: number; events: any[] }> {
  const task = automationTasks.find(t => t.id === 'event-reminder-24hr')!;
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  try {
    const events = await storage.getEvents();
    const upcomingEvents = events.filter((event: Event) => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= in24Hours && eventDate <= in48Hours;
    });
    
    const reminders: any[] = [];
    
    for (const event of upcomingEvents) {
      reminders.push({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        location: event.location,
        zoomLink: event.zoomLink,
        reminderType: '24-hour',
        message: `Reminder: "${event.title}" is tomorrow at ${new Date(event.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      });
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Prepared ${reminders.length} event reminders`, reminders.length);
    
    return { sent: reminders.length, events: reminders };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

export async function runEventReminder1Hr(): Promise<{ sent: number; events: any[] }> {
  const task = automationTasks.find(t => t.id === 'event-reminder-1hr')!;
  const now = new Date();
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  try {
    const events = await storage.getEvents();
    const imminentEvents = events.filter((event: Event) => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= in1Hour && eventDate <= in2Hours;
    });
    
    const reminders: any[] = [];
    
    for (const event of imminentEvents) {
      reminders.push({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        zoomLink: event.zoomLink,
        zoomMeetingId: event.zoomMeetingId,
        zoomPasscode: event.zoomPasscode,
        reminderType: '1-hour',
        message: `Starting Soon: "${event.title}" begins in 1 hour!${event.zoomLink ? ` Join via Zoom: ${event.zoomLink}` : ''}`
      });
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Prepared ${reminders.length} imminent event reminders`, reminders.length);
    
    return { sent: reminders.length, events: reminders };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

export async function runServiceRequestEscalation(): Promise<{ escalated: number; requests: any[] }> {
  const task = automationTasks.find(t => t.id === 'service-request-escalation')!;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  try {
    const requests = await storage.getServiceRequests();
    const pendingOldRequests = requests.filter((req: ServiceRequest) => {
      const createdDate = new Date(req.createdAt!);
      return req.status === 'pending' && 
             req.priority !== 'high' && 
             req.priority !== 'urgent' &&
             createdDate < sevenDaysAgo;
    });
    
    const escalatedRequests: any[] = [];
    
    for (const request of pendingOldRequests) {
      escalatedRequests.push({
        id: request.id,
        title: request.title,
        originalPriority: request.priority,
        newPriority: 'high',
        daysOld: Math.floor((now.getTime() - new Date(request.createdAt!).getTime()) / (24 * 60 * 60 * 1000)),
        action: 'escalate_priority'
      });
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Identified ${escalatedRequests.length} requests for escalation`, escalatedRequests.length);
    
    return { escalated: escalatedRequests.length, requests: escalatedRequests };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

export async function runServiceRequestFollowup(): Promise<{ followups: number; requests: any[] }> {
  const task = automationTasks.find(t => t.id === 'service-request-followup')!;
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  try {
    const requests = await storage.getServiceRequests();
    const inProgressOldRequests = requests.filter((req: ServiceRequest) => {
      const createdDate = new Date(req.createdAt!);
      return req.status === 'in_progress' && createdDate < fourteenDaysAgo;
    });
    
    const followups: any[] = [];
    
    for (const request of inProgressOldRequests) {
      followups.push({
        id: request.id,
        title: request.title,
        status: request.status,
        assignedTo: request.assignedTo,
        daysInProgress: Math.floor((now.getTime() - new Date(request.createdAt!).getTime()) / (24 * 60 * 60 * 1000)),
        action: 'send_followup'
      });
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Identified ${followups.length} requests needing follow-up`, followups.length);
    
    return { followups: followups.length, requests: followups };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

export async function runDocumentExpirationAlert(): Promise<{ alerts: number; documents: any[] }> {
  const task = automationTasks.find(t => t.id === 'document-expiration-alert')!;
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  try {
    const documents = await storage.getDocuments();
    
    const expiringDocuments = documents.filter((doc: Document) => {
      const title = doc.title.toLowerCase();
      if (title.includes('insurance') || title.includes('contract') || title.includes('certificate')) {
        const yearMatch = doc.title.match(/20\d{2}/);
        if (yearMatch) {
          const docYear = parseInt(yearMatch[0]);
          const currentYear = now.getFullYear();
          return docYear <= currentYear;
        }
      }
      return false;
    });
    
    const alerts: any[] = [];
    
    for (const doc of expiringDocuments) {
      alerts.push({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        warningType: 'expiration_review_needed',
        message: `Document "${doc.title}" may need renewal or update review.`
      });
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Identified ${alerts.length} documents for review`, alerts.length);
    
    return { alerts: alerts.length, documents: alerts };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

export async function runRecurringMeetingGenerator(): Promise<{ created: number; meetings: any[] }> {
  const task = automationTasks.find(t => t.id === 'recurring-meeting-generator')!;
  const now = new Date();
  
  try {
    const events = await storage.getEvents();
    
    const futureMonths: Date[] = [];
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const thirdThursday = getThirdThursday(futureDate.getFullYear(), futureDate.getMonth());
      futureMonths.push(thirdThursday);
    }
    
    const newMeetings: any[] = [];
    
    for (const meetingDate of futureMonths) {
      const monthName = meetingDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const meetingExists = events.some((e: Event) => 
        e.title.includes('Board of Directors Meeting') && 
        e.title.includes(monthName.split(' ')[0])
      );
      
      if (!meetingExists) {
        const meetingTime = new Date(meetingDate);
        meetingTime.setHours(19, 0, 0, 0);
        
        const eventData = {
          title: `Board of Directors Meeting - ${monthName}`,
          description: 'Regular monthly board meeting open to all unit owners per N.J.S.A. 46:8B-12.',
          eventDate: meetingTime,
          endDate: new Date(meetingTime.getTime() + 2 * 60 * 60 * 1000),
          location: 'Community Room, Building A',
          zoomLink: 'https://zoom.us/j/123456789',
          zoomMeetingId: '123 456 789',
          zoomPasscode: 'Bramhollow2026',
          isVirtual: true,
          maxAttendees: 50,
          isRecurring: true,
          organizerId: 'system-admin'
        };

        const savedEvent = await storage.createEvent(eventData);
        newMeetings.push(savedEvent);
      }
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Created ${newMeetings.length} future board meetings`, newMeetings.length);
    
    return { created: newMeetings.length, meetings: newMeetings };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

function getThirdThursday(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
  const firstThursday = 1 + daysUntilThursday;
  const thirdThursday = firstThursday + 14;
  return new Date(year, month, thirdThursday);
}

export async function runAnnouncementCleanup(): Promise<{ archived: number; announcements: any[] }> {
  const task = automationTasks.find(t => t.id === 'announcement-cleanup')!;
  const now = new Date();
  
  try {
    const announcements = await storage.getAnnouncements();
    
    const expiredAnnouncements = announcements.filter((a: Announcement) => {
      if (a.expiryDate) {
        return new Date(a.expiryDate) < now;
      }
      return false;
    });
    
    const archived: any[] = [];
    
    for (const announcement of expiredAnnouncements) {
      if (announcement.isPublished) {
        await storage.updateAnnouncement(announcement.id, { isPublished: false });
        archived.push({
          id: announcement.id,
          title: announcement.title,
          expiryDate: announcement.expiryDate,
          action: 'archived'
        });
      }
    }
    
    task.lastRun = now;
    logAutomation(task.id, task.name, 'success', `Archived ${archived.length} expired announcements`, archived.length);
    
    return { archived: archived.length, announcements: archived };
  } catch (error) {
    logAutomation(task.id, task.name, 'failed', `Error: ${error}`);
    throw error;
  }
}

export async function runAllAutomations(): Promise<{
  meetingNotices: any;
  eventReminders24Hr: any;
  eventReminders1Hr: any;
  serviceEscalations: any;
  serviceFollowups: any;
  documentAlerts: any;
  recurringMeetings: any;
  announcementCleanup: any;
}> {
  console.log('[Automation] Running all automation tasks...');
  
  const results = {
    meetingNotices: await runMeetingNotice48Hr(),
    eventReminders24Hr: await runEventReminder24Hr(),
    eventReminders1Hr: await runEventReminder1Hr(),
    serviceEscalations: await runServiceRequestEscalation(),
    serviceFollowups: await runServiceRequestFollowup(),
    documentAlerts: await runDocumentExpirationAlert(),
    recurringMeetings: await runRecurringMeetingGenerator(),
    announcementCleanup: await runAnnouncementCleanup()
  };
  
  console.log('[Automation] All tasks completed.');
  return results;
}

export function getAutomationTasks(): AutomationTask[] {
  return automationTasks;
}

export function getAutomationLogs(): AutomationLog[] {
  return automationLogs;
}

export function toggleAutomationTask(taskId: string, enabled: boolean): AutomationTask | null {
  const task = automationTasks.find(t => t.id === taskId);
  if (task) {
    task.isEnabled = enabled;
    logAutomation(taskId, task.name, 'success', `Task ${enabled ? 'enabled' : 'disabled'}`);
    return task;
  }
  return null;
}

export function getAutomationSummary(): {
  totalTasks: number;
  enabledTasks: number;
  recentLogs: AutomationLog[];
  tasksByCategory: Record<string, number>;
} {
  const tasksByCategory: Record<string, number> = {};
  for (const task of automationTasks) {
    tasksByCategory[task.category] = (tasksByCategory[task.category] || 0) + 1;
  }
  
  return {
    totalTasks: automationTasks.length,
    enabledTasks: automationTasks.filter(t => t.isEnabled).length,
    recentLogs: automationLogs.slice(0, 10),
    tasksByCategory
  };
}
