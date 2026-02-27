# Bramhollow Condominium Association Management System

## Overview
This project is a comprehensive condominium association management platform for Bramhollow Condominium Assoc Inc. It provides a complete solution for community management, including user authentication, service requests, announcements, meeting management, amenity reservations, and quarterly newsletter creation. The system aims to streamline operations and enhance communication within the community. It includes comprehensive help documentation for various user types.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **Router**: Wouter
- **State Management**: TanStack Query

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Key Features and Components
- **Dashboard**: Central hub for service requests, announcements, event management, amenity reservations, and role-based access control.
- **Service Request Management**: Full lifecycle — submit requests, filter by status/category, sort by date/priority/status, status dashboard with counts, manager status updates, messaging/notes system (with internal notes for managers), and expandable request details.
- **Vendor Proposals & RFPs**: Request for proposals system for maintenance service contracts, snow removal, common area floral design & setup, landscaping, roofing, parking lot work, and cleaning. Manager-only creation with vendor contact details, proposed amounts, contract terms, scope of work, due dates, and status tracking (draft → open → under review → awarded/rejected/expired).
- **Newsletter Generator**: Integrated tool with Markdown editor, real-time HTML preview, email template selection, desktop/mobile preview, export functionality, and A/B testing capabilities.
- **Database Schema**: Comprehensive schema for Users, Residents, Units, Service Requests, Announcements, Events, Amenities, and Documents, utilizing Drizzle ORM and Zod for validation.
- **Authentication System**: Replit OpenID Connect integration with role-based access control and PostgreSQL-based session management.
- **Storage Layer**: Drizzle ORM-based database operations with user role-based data filtering.
- **UI Components**: Reusable components for forms, layouts, data display, and navigation.
- **Help Documentation System**: Role-based help guides (Resident, Board Member, Admin, Newsletter, A/B Testing, Troubleshooting, Security, Quick Reference), and a compliance audit summary.
- **Automation System**: Framework for scheduled tasks including notices, reminders, maintenance, compliance, and cleanup, with database persistence for generated content.
- **Automation Dashboard**: Admin-only interface to manage, monitor, and manually trigger automated tasks.
- **"Our Reset" Special Edition Newsletter**: A dedicated dashboard tab documenting Bramhollow's compliance restoration journey, featuring articles, status tracking, and statistics.
- **Area Resources Tab**: Guide to local resources and community services for residents.
- **Newsletter Templates**: Pre-built, category-organized templates tailored for condominium associations, including compliance footers and placeholder text.
- **Document & Law Search Tool**: Searchable reference tool for Master Deed, By-Laws, NJ Condominium Act, and Owner Rights with keyword highlighting and filtering.
- **Governance & Elections Tab**: Information on owner standing, special meetings, voter registration, and election procedures.
- **Alternative Dispute Resolution (ADR) Tab**: Compliance text, hearing request form, and backend integration.
- **Financial Transparency Tab**: Displays 1984 Master Deed financial data scaled to current values, including operating expenses, working capital, and capital reserves.
- **Governing Documents Tab**: Provides official record alerts and PDF download links for core documents.
- **Digital Communication Policy**: Official electronic notice policy (N.J.S.A. 12A:12-1 et seq. UETA) with effective/expiration dates, displayed on landing page and dashboard, establishing website as primary communication channel.
- **Community Definitions Glossary**: Searchable glossary of 23 official document terms (Agent, Assessments, Common Elements, Percentage Interest, Quorum, Reserve, Working Capital, etc.) with original 1984 and CPI-adjusted 2026-27 dollar amounts for financial terms. Derived from Master Deed, By-Laws, Certificate of Incorporation, and NJ Condominium Act.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe SQL ORM
- **@tanstack/react-query**: Server state management
- **marked**: Markdown to HTML conversion
- **express**: Web framework for Node.js

### UI Dependencies
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library