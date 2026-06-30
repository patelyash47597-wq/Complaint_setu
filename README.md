# Complaint Setu

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)](https://github.com/patelyash47597-wq/Complaint_setu)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-⚡-FF005A?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=flat-square&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-FF6B6B?style=flat-square)](https://complaint-setu-r9u2.vercel.app)

**Complaint Setu** is an AI-powered government grievance management portal that enables citizens to file complaints, track resolutions in real-time, and access emergency helplines. Featuring intelligent priority classification, automated duplicate detection, and smart department routing.

**[Live Application](https://complaint-setu-r9u2.vercel.app)** • **[Report Issue](https://github.com/patelyash47597-wq/Complaint_setu/issues)** • **[Documentation](https://github.com/patelyash47597-wq/Complaint_setu/wiki)**

---

## Table of Contents

- [Features](#features)
- [AI Intelligence](#ai-intelligence)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [ML Pipeline](#ml-pipeline)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Core Functionality
- **Complaint Registration** - Submit grievances with detailed descriptions and attachments
- **Real-Time Tracking** - Monitor complaint status with live updates and notifications
- **Emergency Helplines** - Quick access to 24/7 national and local emergency numbers
- **Admin Dashboard** - Comprehensive interface for managing departments and complaints
- **Secure Authentication** - JWT-based user authentication with bcrypt password hashing
- **File Uploads** - Support for evidence and supporting document attachments

### AI-Powered Capabilities
- **Automatic Priority Classification** - Machine learning model assigns urgency levels (Critical/High/Medium/Low)
- **Intelligent Duplicate Detection** - Neural network prevents duplicate complaint submissions with 95%+ accuracy
- **Smart Department Routing** - Automatically assigns complaints to appropriate departments
- **Pattern Recognition** - Identifies trends and emerging issues from complaint data

### User Experience
- **Modern Responsive Design** - Mobile-first interface built with Tailwind CSS
- **Glassmorphic UI** - Contemporary design with smooth animations and transitions
- **WCAG 2.1 AA Compliance** - Fully accessible for all users
- **Professional Color System** - Semantic color coding for visual clarity

### Security
- **CORS Protection** - Configurable cross-origin request handling
- **Rate Limiting** - Global and endpoint-specific request throttling
- **Security Headers** - Helmet.js implementation for enhanced security
- **Environment Encryption** - Secure management of sensitive credentials

---

## AI Intelligence

### Priority Classification Engine

The system automatically analyzes complaint text to assign priority levels:
