import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { insertServiceRequestSchema, insertServiceRequestNoteSchema, insertVendorProposalSchema, insertAnnouncementSchema, insertEventSchema, insertAmenityReservationSchema } from "@shared/schema";
import { 
  getAutomationTasks, 
  getAutomationLogs, 
  getAutomationSummary,
  toggleAutomationTask,
  runAllAutomations,
  runMeetingNotice48Hr,
  runEventReminder24Hr,
  runServiceRequestEscalation,
  runDocumentExpirationAlert,
  runRecurringMeetingGenerator,
  runAnnouncementCleanup
} from "./automation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Unit management routes
  app.get('/api/units', isAuthenticated, async (req, res) => {
    try {
      const units = await storage.getUnits();
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get('/api/units/:id', isAuthenticated, async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Error fetching unit:", error);
      res.status(500).json({ message: "Failed to fetch unit" });
    }
  });

  // Service request routes
  app.get('/api/service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = (await storage.getUser(userId))?.role;
      
      // Residents see only their requests, managers see all
      const requests = userRole === 'manager' || userRole === 'admin' 
        ? await storage.getServiceRequests()
        : await storage.getServiceRequests(userId);
        
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post('/api/service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertServiceRequestSchema.parse({
        ...req.body,
        requesterId: userId
      });
      
      const request = await storage.createServiceRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.patch('/api/service-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only managers/admins can update service requests
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const updatedRequest = await storage.updateServiceRequest(req.params.id, req.body);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Failed to update service request" });
    }
  });

  // Service request notes
  app.get('/api/service-requests/:id/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const notes = await storage.getServiceRequestNotes(req.params.id);
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.json(notes.filter(n => !n.isInternal));
      }
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post('/api/service-requests/:id/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const isManager = user?.role === 'manager' || user?.role === 'admin';
      const validatedData = insertServiceRequestNoteSchema.parse({
        ...req.body,
        serviceRequestId: req.params.id,
        authorId: userId,
        isInternal: isManager ? (req.body.isInternal || false) : false,
      });
      const note = await storage.createServiceRequestNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Vendor proposal routes
  app.get('/api/vendor-proposals', isAuthenticated, async (req: any, res) => {
    try {
      const proposals = await storage.getVendorProposals();
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching vendor proposals:", error);
      res.status(500).json({ message: "Failed to fetch vendor proposals" });
    }
  });

  app.post('/api/vendor-proposals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only managers and admins can create vendor proposals" });
      }
      const validatedData = insertVendorProposalSchema.parse({
        ...req.body,
        submittedBy: userId
      });
      const proposal = await storage.createVendorProposal(validatedData);
      res.status(201).json(proposal);
    } catch (error) {
      console.error("Error creating vendor proposal:", error);
      res.status(500).json({ message: "Failed to create vendor proposal" });
    }
  });

  app.patch('/api/vendor-proposals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only managers and admins can update vendor proposals" });
      }
      const updated = await storage.updateVendorProposal(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor proposal:", error);
      res.status(500).json({ message: "Failed to update vendor proposal" });
    }
  });

  // Announcement routes (including newsletters)
  app.get('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Residents see only published announcements
      const isPublished = user?.role === 'manager' || user?.role === 'admin' ? undefined : true;
      const announcements = await storage.getAnnouncements(isPublished);
      
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only managers/admins can create announcements
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertAnnouncementSchema.parse({
        ...req.body,
        authorId: userId
      });
      
      const announcement = await storage.createAnnouncement(validatedData);
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch('/api/announcements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only managers/admins can update announcements
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const updatedAnnouncement = await storage.updateAnnouncement(req.params.id, req.body);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only board members/managers/admins can create events
      if (user?.role !== 'board_member' && user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId
      });
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Amenity routes
  app.get('/api/amenities', isAuthenticated, async (req, res) => {
    try {
      const amenities = await storage.getAmenities();
      res.json(amenities);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      res.status(500).json({ message: "Failed to fetch amenities" });
    }
  });

  // Amenity reservation routes
  app.get('/api/reservations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Residents see only their reservations, managers see all
      const reservations = user?.role === 'manager' || user?.role === 'admin'
        ? await storage.getReservations()
        : await storage.getReservations(userId);
        
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  app.post('/api/reservations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAmenityReservationSchema.parse({
        ...req.body,
        userId
      });
      
      const reservation = await storage.createReservation(validatedData);
      res.status(201).json(reservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ message: "Failed to create reservation" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { category } = req.query;
      
      // Residents see only public documents
      const isPublic = user?.role === 'manager' || user?.role === 'admin' ? undefined : true;
      const documents = await storage.getDocuments(category, isPublic);
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // ADR (Alternative Dispute Resolution) request route
  app.post('/api/adr-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, unitNumber, description } = req.body;

      if (!name || !unitNumber || !description) {
        return res.status(400).json({ message: "Name, unit number, and description are required" });
      }

      const serviceRequest = await storage.createServiceRequest({
        title: `ADR Hearing Request - Unit ${unitNumber}`,
        description: `ADR HEARING REQUEST\n\nRequester: ${name}\nUnit: ${unitNumber}\n\nDescription of Dispute:\n${description}`,
        category: 'other',
        priority: 'high',
        status: 'pending',
        requesterId: userId,
      });

      res.status(201).json(serviceRequest);
    } catch (error) {
      console.error("Error creating ADR request:", error);
      res.status(500).json({ message: "Failed to submit ADR request" });
    }
  });

  // Newsletter generation route (enhanced from original functionality)
  app.post('/api/newsletters/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only managers/admins can generate newsletters
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // This endpoint returns the generated HTML for newsletter
      // The actual newsletter generation logic is handled in the frontend
      res.json({ 
        message: "Newsletter generation endpoint ready",
        hasPermission: true 
      });
    } catch (error) {
      console.error("Error in newsletter generation:", error);
      res.status(500).json({ message: "Failed to process newsletter generation" });
    }
  });

  // Automation routes (admin only)
  app.get('/api/automation/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const tasks = getAutomationTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching automation tasks:", error);
      res.status(500).json({ message: "Failed to fetch automation tasks" });
    }
  });

  app.get('/api/automation/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const logs = getAutomationLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching automation logs:", error);
      res.status(500).json({ message: "Failed to fetch automation logs" });
    }
  });

  app.get('/api/automation/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const summary = getAutomationSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching automation summary:", error);
      res.status(500).json({ message: "Failed to fetch automation summary" });
    }
  });

  app.post('/api/automation/tasks/:taskId/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { taskId } = req.params;
      const { enabled } = req.body;
      
      const task = toggleAutomationTask(taskId, enabled);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error toggling automation task:", error);
      res.status(500).json({ message: "Failed to toggle automation task" });
    }
  });

  app.post('/api/automation/run-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const results = await runAllAutomations();
      res.json({ message: "All automation tasks executed", results });
    } catch (error) {
      console.error("Error running all automations:", error);
      res.status(500).json({ message: "Failed to run automation tasks" });
    }
  });

  app.post('/api/automation/run/:taskId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'manager' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { taskId } = req.params;
      let result;
      
      switch (taskId) {
        case 'meeting-notice-48hr':
          result = await runMeetingNotice48Hr();
          break;
        case 'event-reminder-24hr':
          result = await runEventReminder24Hr();
          break;
        case 'service-request-escalation':
          result = await runServiceRequestEscalation();
          break;
        case 'document-expiration-alert':
          result = await runDocumentExpirationAlert();
          break;
        case 'recurring-meeting-generator':
          result = await runRecurringMeetingGenerator();
          break;
        case 'announcement-cleanup':
          result = await runAnnouncementCleanup();
          break;
        default:
          return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: `Task ${taskId} executed`, result });
    } catch (error) {
      console.error("Error running automation task:", error);
      res.status(500).json({ message: "Failed to run automation task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
