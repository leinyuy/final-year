# Project Overview

A streamlined web application connecting project proposers with freelance developers in Cameroon, focusing on simplicity and security. Features include user authentication, project proposals, developer profiles, secure messaging, and integrated mobile money payments.



## User Roles

### Client
- Posts project proposals
- Manages project details
- Reviews developer applications

### Developer
- Applies to proposals
- Creates and maintains skill profile
- Manages job offers

### Admin
- Platform oversight
- Content moderation
- Dispute resolution

## Core Features

### User Authentication
- Email/password registration with social sign-in options
- Email verification
- Role-based access control

### Profile Management
#### Developer Profiles
- Skills listing
- Portfolio showcase
- Rating system
- Experience verification

#### Client Profiles
- Project history
- Rating system
- Payment verification

### Project Management
- Detailed proposal posting
- Budget and deadline setting
- Skill requirement specification
- Proposal visibility controls

### Application System
- Developer proposal submissions
- Integrated messaging
- Real-time notifications
- Application tracking

### Payment Integration
- Mobile money gateway integration (Campay)
- Escrow payment system
  - Milestone-based releases
  - Two-party confirmation
- Transaction tracking
- Developer withdrawal system
  - Mobile money withdrawal requests
  - Withdrawal status tracking
  - Unique reference generation for idempotency
- Payment history with detailed status tracking
- Support for multiple mobile money providers (MTN, Orange)

### Communication
- Direct messaging system
- Secure channels
- Real-time notifications
- File sharing capabilities

### Security Measures
- End-to-end HTTPS
- Strict Firebase security rules
- Regular security audits
- Data minimization

### Rating System
- Post-project reviews
- Bilateral feedback
- Dispute resolution process

## Common Challenges & Solutions

### Trust Building
- Verified user badges
- Transparent rating system
- Clear review process

### Communication
- Streamlined messaging interface
- Instant notifications
- Clear status updates

### Payments
- Transparent fee structure
- Clear payment milestones
- Secure transaction handling

### Support
- Comprehensive FAQ
- Clear dispute resolution
- Admin mediation process

## Application Flow

### 1. Landing Page
- Platform overview
- Registration CTAs
- Value proposition

### 2. User Onboarding
- Role selection
- Basic information collection
- Email verification
- Secure authentication

### 3. Dashboard Interface
#### Client Dashboard
- Project management
- Payment tracking
- Developer communications

#### Developer Dashboard
- Project discovery
- Profile management
- Client communications

### 4. Project Creation
- Structured proposal form
- File attachments
- Review process

### 5. Project Application
- Proposal submission
- Real-time messaging
- Status tracking

### 6. Payment Processing
- Mobile money integration
- Escrow management
- Transaction tracking

### 7. Review System
- Post-project feedback
- Rating submission
- Profile updates

### 8. Administration
- User management
- Content moderation
- Issue resolution

## Database Schema

### Collections

#### users
- `uid` (string) - Firebase Auth UID
- `role` (string) - "client" | "developer" | "admin"
- `email` (string)
- `fullName` (string)
- `phoneNumber` (string)
- `createdAt` (timestamp)
- `lastActive` (timestamp)
- `isVerified` (boolean)
- `profileComplete` (boolean)
- `avatar` (string) - URL
- `status` (string) - "active" | "suspended" | "inactive"

#### developerProfiles
- `uid` (string) - References users
- `bio` (string)
- `skills` (array)
- `experience` (array)
  - `title` (string)
  - `company` (string)
  - `duration` (string)
  - `description` (string)
- `portfolio` (array)
  - `title` (string)
  - `description` (string)
  - `link` (string)
  - `images` (array)
- `education` (array)
- `certifications` (array)
- `hourlyRate` (number)
- `availability` (string)
- `rating` (number)
- `totalProjects` (number)
- `successRate` (number)

#### clientProfiles
- `uid` (string) - References users
- `companyName` (string)
- `industry` (string)
- `description` (string)
- `website` (string)
- `location` (string)
- `rating` (number)
- `totalProjects` (number)
- `projectsCompleted` (number)

#### projects
- `id` (string)
- `clientId` (string) - References users
- `title` (string)
- `description` (string)
- `requirements` (array)
- `budget` (object)
  - `min` (number)
  - `max` (number)
  - `type` (string) - "fixed" | "hourly"
- `duration` (object)
  - `timeframe` (number)
  - `unit` (string) - "days" | "weeks" | "months"
- `status` (string) - "draft" | "active" | "in_progress" | "completed" | "cancelled"
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `attachments` (array)
- `visibility` (string) - "public" | "private" | "invited"
- `skills` (array)
- `category` (string)

#### applications
- `id` (string)
- `projectId` (string) - References projects
- `developerId` (string) - References users
- `proposal` (string)
- `bidAmount` (number)
- `estimatedDuration` (object)
- `status` (string) - "pending" | "accepted" | "rejected" | "withdrawn"
- `createdAt` (timestamp)
- `attachments` (array)

#### contracts
- `id` (string)
- `projectId` (string) - References projects
- `clientId` (string) - References users
- `developerId` (string) - References users
- `terms` (string)
- `milestones` (array)
  - `description` (string)
  - `amount` (number)
  - `dueDate` (timestamp)
  - `status` (string)
- `status` (string) - "draft" | "active" | "completed" | "terminated"
- `startDate` (timestamp)
- `endDate` (timestamp)

#### payments
- `id` (string)
- `contractId` (string) - References contracts
- `projectId` (string) - References projects
- `amount` (number)
- `type` (string) - "milestone" | "deposit" | "refund"
- `status` (string) - "pending" | "completed" | "failed"
- `provider` (string) - "mtn" | "orange"
- `transactionId` (string)
- `timestamp` (timestamp)
- `withdrawalStatus` (string) - "pending" | "completed" | "failed"
- `withdrawalReference` (string)
- `withdrawalRequestedAt` (timestamp)
- `operator` (string)
- `operatorReference` (string)
- `externalReference` (string) - UUID for idempotency
- `description` (string)

#### messages
- `id` (string)
- `senderId` (string) - References users
- `receiverId` (string) - References users
- `content` (string)
- `timestamp` (timestamp)
- `read` (boolean)
- `attachments` (array)

#### reviews
- `id` (string)
- `projectId` (string) - References projects
- `reviewerId` (string) - References users
- `receiverId` (string) - References users
- `rating` (number)
- `comment` (string)
- `timestamp` (timestamp)

#### notifications
- `id` (string)
- `userId` (string) - References users
- `type` (string)
- `title` (string)
- `message` (string)
- `read` (boolean)
- `timestamp` (timestamp)
- `link` (string)

## Project Structure
