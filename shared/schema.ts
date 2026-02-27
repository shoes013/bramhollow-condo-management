import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean, 
  decimal, 
  date,
  jsonb,
  index 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - residents and management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ['resident', 'board_member', 'manager', 'admin'] }).default('resident'),
  unitNumber: varchar("unit_number"),
  phoneNumber: varchar("phone_number"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Condominium units
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitNumber: varchar("unit_number").notNull().unique(),
  floor: integer("floor"),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 2, scale: 1 }),
  squareFeet: integer("square_feet"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  ownerId: varchar("owner_id").references(() => users.id),
  tenantId: varchar("tenant_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service requests
export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { 
    enum: ['maintenance', 'plumbing', 'electrical', 'hvac', 'cleaning', 'landscaping', 'other'] 
  }).notNull(),
  priority: varchar("priority", { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium'),
  status: varchar("status", { 
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'] 
  }).default('pending'),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  unitId: varchar("unit_id").references(() => units.id),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service request notes/messages
export const serviceRequestNotes = pgTable("service_request_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").notNull().references(() => serviceRequests.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor proposals / RFPs
export const vendorProposals = pgTable("vendor_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", {
    enum: ['maintenance_contract', 'snow_removal', 'floral_design', 'landscaping', 'roofing', 'parking_lot', 'cleaning', 'general']
  }).notNull(),
  status: varchar("status", {
    enum: ['draft', 'open', 'under_review', 'awarded', 'rejected', 'expired']
  }).default('draft'),
  vendorName: varchar("vendor_name"),
  vendorContact: varchar("vendor_contact"),
  vendorEmail: varchar("vendor_email"),
  vendorPhone: varchar("vendor_phone"),
  proposedAmount: decimal("proposed_amount", { precision: 12, scale: 2 }),
  contractTerm: varchar("contract_term"),
  scopeOfWork: text("scope_of_work"),
  submittedBy: varchar("submitted_by").notNull().references(() => users.id),
  dueDate: date("due_date"),
  awardedDate: date("awarded_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Announcements and newsletters
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { enum: ['newsletter', 'announcement', 'alert', 'event'] }).notNull(),
  isPublished: boolean("is_published").default(false),
  authorId: varchar("author_id").notNull().references(() => users.id),
  publishDate: timestamp("publish_date"),
  expiryDate: timestamp("expiry_date"),
  priority: varchar("priority", { enum: ['low', 'medium', 'high'] }).default('medium'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events and meetings
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location"),
  zoomLink: varchar("zoom_link"),
  zoomMeetingId: varchar("zoom_meeting_id"),
  zoomPasscode: varchar("zoom_passcode"),
  isVirtual: boolean("is_virtual").default(false),
  maxAttendees: integer("max_attendees"),
  isRecurring: boolean("is_recurring").default(false),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs
export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ['attending', 'not_attending', 'maybe'] }).notNull(),
  guestCount: integer("guest_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Building amenities
export const amenities = pgTable("amenities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  location: varchar("location"),
  capacity: integer("capacity"),
  isAvailable: boolean("is_available").default(true),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  rules: text("rules"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Amenity reservations
export const amenityReservations = pgTable("amenity_reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amenityId: varchar("amenity_id").notNull().references(() => amenities.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: varchar("status", { enum: ['pending', 'approved', 'cancelled'] }).default('pending'),
  totalCost: decimal("total_cost", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial documents and statements
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  filePath: varchar("file_path"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  category: varchar("category", { 
    enum: ['financial', 'legal', 'maintenance', 'insurance', 'meeting_minutes', 'other'] 
  }).notNull(),
  isPublic: boolean("is_public").default(false),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  ownedUnits: many(units, { relationName: "owner" }),
  rentedUnits: many(units, { relationName: "tenant" }),
  serviceRequests: many(serviceRequests),
  announcements: many(announcements),
  events: many(events),
  eventRsvps: many(eventRsvps),
  reservations: many(amenityReservations),
  documents: many(documents),
}));

export const unitsRelations = relations(units, ({ one }) => ({
  owner: one(users, { fields: [units.ownerId], references: [users.id], relationName: "owner" }),
  tenant: one(users, { fields: [units.tenantId], references: [users.id], relationName: "tenant" }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  requester: one(users, { fields: [serviceRequests.requesterId], references: [users.id] }),
  assignedUser: one(users, { fields: [serviceRequests.assignedTo], references: [users.id] }),
  unit: one(units, { fields: [serviceRequests.unitId], references: [units.id] }),
  notes: many(serviceRequestNotes),
}));

export const serviceRequestNotesRelations = relations(serviceRequestNotes, ({ one }) => ({
  serviceRequest: one(serviceRequests, { fields: [serviceRequestNotes.serviceRequestId], references: [serviceRequests.id] }),
  author: one(users, { fields: [serviceRequestNotes.authorId], references: [users.id] }),
}));

export const vendorProposalsRelations = relations(vendorProposals, ({ one }) => ({
  submitter: one(users, { fields: [vendorProposals.submittedBy], references: [users.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, { fields: [announcements.authorId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}));

export const amenityReservationsRelations = relations(amenityReservations, ({ one }) => ({
  amenity: one(amenities, { fields: [amenityReservations.amenityId], references: [amenities.id] }),
  user: one(users, { fields: [amenityReservations.userId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  uploader: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertUnitSchema = createInsertSchema(units).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAmenitySchema = createInsertSchema(amenities).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAmenityReservationSchema = createInsertSchema(amenityReservations).omit({ 
  id: true, 
  createdAt: true 
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export const insertServiceRequestNoteSchema = createInsertSchema(serviceRequestNotes).omit({
  id: true,
  createdAt: true
});

export const insertVendorProposalSchema = createInsertSchema(vendorProposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequestNote = typeof serviceRequestNotes.$inferSelect;
export type InsertServiceRequestNote = z.infer<typeof insertServiceRequestNoteSchema>;
export type VendorProposal = typeof vendorProposals.$inferSelect;
export type InsertVendorProposal = z.infer<typeof insertVendorProposalSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type AmenityReservation = typeof amenityReservations.$inferSelect;
export type InsertAmenityReservation = z.infer<typeof insertAmenityReservationSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
