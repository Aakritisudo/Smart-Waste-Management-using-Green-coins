# ♻️ Smart Waste Management & Green Coins

### A React-Based Smart Waste Segregation and Citizen Reward Platform

Smart Waste Management is a web-based platform designed to encourage responsible household waste segregation through a digital reward system. Citizens can upload photographs of segregated waste, get submissions verified, earn Green Coins, and redeem rewards at participating local shops.

The platform connects citizens, municipal authorities, waste collection workers, administrators, and local businesses through a unified application.

## 🌱 Problem Statement

Improper waste segregation and a lack of incentives discourage citizens from adopting sustainable waste disposal practices.

This project aims to address these challenges by introducing a technology-driven reward ecosystem that:

- Encourages household waste segregation.
- Rewards citizens for responsible waste disposal.
- Simplifies waste collection and verification.
- Connects local businesses with environmentally conscious citizens.
- Helps municipal authorities monitor community participation.

## ✨ Key Features

### 1. Citizen Dashboard
- Upload waste photographs for verification.
- Select waste categories before submission.
- Earn Green Coins for approved contributions.
- Track coin balance and transaction history.
- View community environmental impact.

### 2. Smart Waste Classification
- Photograph-based waste submission.
- Image classification through an optional AI-powered verification system.
- Confidence-based approval and manual review workflow.
- Supports five waste categories:
  - Wet Waste
  - Dry Waste
  - Recyclable Waste
  - Hazardous Waste
  - E-Waste

### 3. Green Coins Reward System
- Citizens earn coins for approved waste contributions.
- Different waste categories have different reward values.
- Wallet displays earned coins and transaction history.
- Citizens can redeem coins for offers at approved partner shops.

### 4. Doorstep Waste Collection
- Citizens can request household waste pickups.
- Collection requests include waste category and estimated quantity.
- Municipal officers can assign collection workers.
- Workers verify collection using handover codes.
- Actual collected weight is recorded.
- Coins are credited after collection verification.

### 5. Partner Shop Dashboard
- Local businesses can apply to become reward partners.
- Shop applications require administrative approval.
- Approved shops can configure reward offers.
- Shops can verify citizen redemption codes.
- Daily redemption limits can be managed.

### 6. Admin Dashboard
- Review submitted waste photographs.
- Approve or reject submissions.
- Manage partner shop applications.
- Monitor platform statistics.
- Track coins issued and redemptions.

### 7. Municipal Dashboard
- Monitor household participation.
- View locality-wise waste collection analytics.
- Track pending and overdue pickups.
- Assign collection workers.
- Verify completed collections.
- Monitor collected waste by category.

## ⚛️ React.js Concepts Used

The application uses React to build reusable, interactive user interfaces.

| React Concept | Application |
|---|---|
| Functional Components | Citizen, Admin, Shop, Worker and Municipal dashboards |
| useState | Managing UI state, forms, tabs and user interactions |
| useEffect | Loading dashboard information and API data |
| useCallback | Optimizing reusable data-fetching functions |
| Props | Passing data and callbacks between components |
| Conditional Rendering | Displaying role-specific dashboards and submission statuses |
| Event Handling | Handling uploads, form submissions and user actions |
| Component Reusability | Shared UI elements and reusable components |

## 🛠️ Technology Stack

**Frontend**
- React.js 18
- Next.js 14 (App Router)
- JavaScript (ES6+)
- HTML5
- CSS3
- Three.js for 3D visual elements

**Backend**
- Next.js API Routes
- Server-side JavaScript
- REST API architecture
- JWT-based session authentication using JOSE

**AI Integration**
- Anthropic Claude API (optional image classification)
- Image verification and confidence-based decision logic

**Testing**
- Node.js Test Runner
- Unit testing for program rules and collection logic

**Development Tools**
- Visual Studio Code
- Git
- GitHub
- npm

## 🏗️ Project Architecture

The application follows a component-based architecture.

```text
smart-waste-management/
│
├── app/
│   ├── api/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── municipal/
│   │   ├── worker/
│   │   ├── submissions/
│   │   ├── pickups/
│   │   ├── wallet/
│   │   ├── shops/
│   │   └── redemptions/
│   │
│   ├── admin/
│   ├── dashboard/
│   ├── login/
│   ├── register/
│   ├── municipal/
│   ├── shop/
│   ├── worker/
│   ├── layout.js
│   └── globals.css
│
├── components/
│   ├── CitizenApp.jsx
│   ├── AdminApp.jsx
│   ├── MunicipalApp.jsx
│   ├── WorkerApp.jsx
│   ├── ShopApp.jsx
│   ├── AuthFlow.jsx
│   ├── AuthShell.jsx
│   └── Scene3D.jsx
│
├── lib/
│   ├── auth.js
│   ├── classify.js
│   ├── config.js
│   ├── wallet.js
│   ├── collection.js
│   ├── analytics.js
│   └── pickup.js
│
├── public/
├── test/
├── middleware.js
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm
- Git

### Step 1: Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### Step 2: Navigate to the Project

```bash
cd smart-waste-management
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env.local` file in the project root.

For optional AI-based image classification:

```env
ANTHROPIC_API_KEY=your_api_key
AI_MODEL=claude-haiku-5-5
```

For local demonstration, the application can run without an AI API key using its built-in demo classification mode.

### Step 5: Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

**http://localhost:3000**

### Step 6: Run Tests

```bash
npm test
```

## 🔄 Application Workflow

1. A citizen registers or logs into the platform.
2. The citizen selects a waste category and uploads a photograph.
3. The photograph is checked through the classification workflow.
4. Approved submissions generate Green Coins.
5. Citizens can use their coins to redeem partner shop offers.
6. Citizens can also request doorstep waste collection.
7. Municipal officers assign collection workers.
8. Workers record the actual collected waste quantity.
9. The collection is verified before applicable rewards are credited.
10. Municipal authorities monitor participation and environmental impact through analytics.

## 🔐 User Roles

| Role | Responsibilities |
|---|---|
| Citizen | Submit waste photographs, earn coins, request pickups and redeem rewards |
| Administrator | Review submissions, approve shops and monitor platform activity |
| Municipal Officer | Manage pickups, assign workers and analyze locality performance |
| Collection Worker | Collect waste and record verified quantities |
| Partner Shop | Manage offers and verify redemption codes |

## 🚀 Future Enhancements

- Integration with a production database such as PostgreSQL.
- More advanced AI-based waste classification.
- Real-time notifications for pickup scheduling.
- GPS-based waste collection tracking.
- Interactive municipal analytics and reporting.
- Mobile application for citizens and collection workers.
- Integration with additional local businesses and recycling centers.

## 🌍 Expected Impact

The platform aims to make waste segregation more engaging by connecting environmental responsibility with tangible rewards.

It creates a collaborative ecosystem in which citizens, municipal authorities, waste collection workers and local businesses contribute towards cleaner and more sustainable communities.

---

**Developed as a React-based Smart Waste Management project using Next.js and modern web technologies.**
