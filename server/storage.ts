import {
  users,
  units,
  serviceRequests,
  serviceRequestNotes,
  vendorProposals,
  announcements,
  events,
  eventRsvps,
  amenities,
  amenityReservations,
  documents,
  type User,
  type UpsertUser,
  type Unit,
  type InsertUnit,
  type ServiceRequest,
  type InsertServiceRequest,
  type ServiceRequestNote,
  type InsertServiceRequestNote,
  type VendorProposal,
  type InsertVendorProposal,
  type Announcement,
  type InsertAnnouncement,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type Amenity,
  type InsertAmenity,
  type AmenityReservation,
  type InsertAmenityReservation,
  type Document,
  type InsertDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Unit operations
  getUnits(): Promise<Unit[]>;
  getUnit(id: string): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit>;
  
  // Service request operations
  getServiceRequests(userId?: string): Promise<ServiceRequest[]>;
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, request: Partial<InsertServiceRequest>): Promise<ServiceRequest>;
  
  // Service request note operations
  getServiceRequestNotes(serviceRequestId: string): Promise<ServiceRequestNote[]>;
  createServiceRequestNote(note: InsertServiceRequestNote): Promise<ServiceRequestNote>;

  // Vendor proposal operations
  getVendorProposals(): Promise<VendorProposal[]>;
  getVendorProposal(id: string): Promise<VendorProposal | undefined>;
  createVendorProposal(proposal: InsertVendorProposal): Promise<VendorProposal>;
  updateVendorProposal(id: string, proposal: Partial<InsertVendorProposal>): Promise<VendorProposal>;

  // Announcement operations
  getAnnouncements(isPublished?: boolean): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  
  // Amenity operations
  getAmenities(): Promise<Amenity[]>;
  getAmenity(id: string): Promise<Amenity | undefined>;
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  updateAmenity(id: string, amenity: Partial<InsertAmenity>): Promise<Amenity>;
  
  // Reservation operations
  getReservations(userId?: string): Promise<AmenityReservation[]>;
  createReservation(reservation: InsertAmenityReservation): Promise<AmenityReservation>;
  
  // Document operations
  getDocuments(category?: string, isPublic?: boolean): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Unit operations
  async getUnits(): Promise<Unit[]> {
    return await db.select().from(units).orderBy(units.unitNumber);
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    const [unit] = await db.select().from(units).where(eq(units.id, id));
    return unit;
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const [newUnit] = await db.insert(units).values(unit).returning();
    return newUnit;
  }

  async updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit> {
    const [updatedUnit] = await db
      .update(units)
      .set({ ...unit, updatedAt: new Date() })
      .where(eq(units.id, id))
      .returning();
    return updatedUnit;
  }

  // Service request operations
  async getServiceRequests(userId?: string): Promise<ServiceRequest[]> {
    const query = db.select().from(serviceRequests);
    if (userId) {
      return await query.where(eq(serviceRequests.requesterId, userId)).orderBy(desc(serviceRequests.createdAt));
    }
    return await query.orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [newRequest] = await db.insert(serviceRequests).values(request).returning();
    return newRequest;
  }

  async updateServiceRequest(id: string, request: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Service request note operations
  async getServiceRequestNotes(serviceRequestId: string): Promise<ServiceRequestNote[]> {
    return await db.select().from(serviceRequestNotes)
      .where(eq(serviceRequestNotes.serviceRequestId, serviceRequestId))
      .orderBy(serviceRequestNotes.createdAt);
  }

  async createServiceRequestNote(note: InsertServiceRequestNote): Promise<ServiceRequestNote> {
    const [newNote] = await db.insert(serviceRequestNotes).values(note).returning();
    return newNote;
  }

  // Vendor proposal operations
  async getVendorProposals(): Promise<VendorProposal[]> {
    return await db.select().from(vendorProposals).orderBy(desc(vendorProposals.createdAt));
  }

  async getVendorProposal(id: string): Promise<VendorProposal | undefined> {
    const [proposal] = await db.select().from(vendorProposals).where(eq(vendorProposals.id, id));
    return proposal;
  }

  async createVendorProposal(proposal: InsertVendorProposal): Promise<VendorProposal> {
    const [newProposal] = await db.insert(vendorProposals).values(proposal).returning();
    return newProposal;
  }

  async updateVendorProposal(id: string, proposal: Partial<InsertVendorProposal>): Promise<VendorProposal> {
    const [updated] = await db
      .update(vendorProposals)
      .set({ ...proposal, updatedAt: new Date() })
      .where(eq(vendorProposals.id, id))
      .returning();
    return updated;
  }

  // Announcement operations
  async getAnnouncements(isPublished?: boolean): Promise<Announcement[]> {
    const query = db.select().from(announcements);
    if (isPublished !== undefined) {
      return await query.where(eq(announcements.isPublished, isPublished)).orderBy(desc(announcements.createdAt));
    }
    return await query.orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({ ...announcement, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.eventDate);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  // Amenity operations
  async getAmenities(): Promise<Amenity[]> {
    return await db.select().from(amenities).orderBy(amenities.name);
  }

  async getAmenity(id: string): Promise<Amenity | undefined> {
    const [amenity] = await db.select().from(amenities).where(eq(amenities.id, id));
    return amenity;
  }

  async createAmenity(amenity: InsertAmenity): Promise<Amenity> {
    const [newAmenity] = await db.insert(amenities).values(amenity).returning();
    return newAmenity;
  }

  async updateAmenity(id: string, amenity: Partial<InsertAmenity>): Promise<Amenity> {
    const [updatedAmenity] = await db
      .update(amenities)
      .set({ ...amenity, updatedAt: new Date() })
      .where(eq(amenities.id, id))
      .returning();
    return updatedAmenity;
  }

  // Reservation operations
  async getReservations(userId?: string): Promise<AmenityReservation[]> {
    const query = db.select().from(amenityReservations);
    if (userId) {
      return await query.where(eq(amenityReservations.userId, userId)).orderBy(desc(amenityReservations.startTime));
    }
    return await query.orderBy(desc(amenityReservations.startTime));
  }

  async createReservation(reservation: InsertAmenityReservation): Promise<AmenityReservation> {
    const [newReservation] = await db.insert(amenityReservations).values(reservation).returning();
    return newReservation;
  }

  // Document operations
  async getDocuments(category?: string, isPublic?: boolean): Promise<Document[]> {
    let whereConditions = [];
    if (category) {
      whereConditions.push(eq(documents.category, category));
    }
    if (isPublic !== undefined) {
      whereConditions.push(eq(documents.isPublic, isPublic));
    }
    
    const query = db.select().from(documents);
    if (whereConditions.length > 0) {
      return await query.where(and(...whereConditions)).orderBy(desc(documents.createdAt));
    }
    return await query.orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }
}

export const storage = new DatabaseStorage();
