✅ kleerFUEL PRD (Refined & Production-Ready)

Version: 2.0
Tagline: Total Fuel Visibility. Zero Shrinkage.

1. Executive Summary

kleerFUEL is a multi-tenant SaaS fuel management platform combining:

ERP (operations + procurement + compliance)
IoT tank monitoring (real-time telemetry)
AI-powered OCR (field data capture)
Offline-first PWA (field operations)

The system provides end-to-end fuel accountability, eliminating losses from theft, leaks, and supplier discrepancies through automated reconciliation and anomaly detection.

2. Product Objectives
Primary Goals
Eliminate fuel shrinkage (target: <0.5%)
Provide real-time fuel visibility across all depots
Automate reconciliation between:
Dispensed fuel
Tank levels
Supplier deliveries
Secondary Goals
Simplify SARS diesel rebate compliance
Enable scalable SaaS deployment across multiple clients
Reduce manual data capture errors via OCR + IoT
3. System Architecture
3.1 High-Level Architecture

Layers:

IoT Layer
Data Ingestion Layer
Core Backend (ERP + Logic Engine)
Frontend (Admin + PWA)
AI Processing Layer
3.2 Technology Stack (Cleaned)
Frontend
Admin Dashboard: React.js
Field App (PWA): Vanilla JS (offline-first)
Backend
Python (FastAPI)
Supabase (PostgreSQL + Auth + Realtime)
Local Storage
SQLite (PWA offline sync)
IoT Integration
Protocols:
RS485 / Modbus (wired)
LoRaWAN / Sigfox (wireless)
Data Frequency:
Configurable (default: 15–60 min)
AI Layer
OCR Engine: Tesseract.js
Use Cases:
Odometer readings
Pump meter readings
Supplier delivery notes
4. Core System Modules
4.1 IoT Tank Monitoring Module
Features
Continuous tank level tracking
Historical trend logging
Real-time alerts
Key Events
Fuel level drop
Fuel refill detection
Sensor offline alert
Smart Logic
Detect unauthorized fuel drops during “Quiet Hours”
Trigger High Priority Alerts
4.2 Procurement & Supplier Module
Features
Purchase Order (PO) generation
Supplier database management
OTP-based delivery verification
Automation

Auto-PO triggered when:

Tank Level ≤ Threshold
Verification
OCR (delivery note)
IoT (actual volume increase)
4.3 PWA (Field Operations)
Characteristics
Offline-first
Syncs when online
QR-based workflows
Core Actions
Refuel Vehicle
Scan vehicle QR
Capture odometer (OCR)
Select tank
Capture pump readings
Auto-calculate liters
Refill Tank
Scan tank QR
Capture invoice (OCR)
Capture tanker readings
Validate against IoT increase
Manual Dip Entry
Used as third validation input
4.4 AI OCR Module
Inputs
Images from mobile device
Outputs
Structured numeric data:
Odometer
Liters
Invoice values
Validation Layer
Confidence scoring
Manual override option
4.5 Anomaly Detection Engine (Critical)
Triple-Check Logic

The system performs 3-way reconciliation:

Transaction Total (PWA)
IoT Delta (Tank Sensor)
Manual Dip (Physical Check)
🚨 Theft / Leak Detection Rule
IF IoT_Delta > Transaction_Total
THEN Loss = IoT_Delta - Transaction_Total
Additional Rules
If Supplier Delivery ≠ IoT Increase → Supplier discrepancy
If Manual Dip ≠ IoT → Sensor calibration issue
5. Data Model (Essential Entities)
Core Entities
Company (Tenant)
Users (Roles: Admin, Ops, Viewer)
Depots
Tanks
Vehicles
Drivers
Suppliers
Transactions (Refuel)
Deliveries (Refill)
IoT Readings
Manual Dips
6. User Roles & Permissions
Admin
Full system control
Manage users, depots, tanks, suppliers
View reports and anomalies
Ops (Field Users)
Perform refuels and refills
Capture OCR data
Enter manual dips
Super Admin (SaaS Owner)
Manage tenants
Billing & subscriptions
Platform analytics
7. Reporting & Analytics
7.1 Core Reports
1. One-Page Month-End Reconciliation

Includes:

Opening stock
Total dispensed
Total received
Closing stock
Variance %
Sensor vs Manual accuracy score
2. Live Inventory Dashboard
Tank levels (real-time)
Consumption trends
Refill predictions
3. Anomaly Log
Timestamp
Tank
Type (Theft / Leak / Supplier mismatch)
Volume loss
4. Supplier Accuracy Report
Supplier Delivered vs IoT Measured
5. SARS Diesel Rebate Export
Fully compliant logbook
Vehicle-based consumption tracking
8. SaaS & Billing Model
Plans
Starter
Standard
Pro
Enterprise
Billing Drivers
Number of tanks
Number of vehicles
IoT integrations
Data storage
9. Menu Structure (Cleaned & Fixed)
9.1 Authentication
Login
Register
9.2 Admin Panel
Fleet
Drivers
Vehicles
Vehicle Types
Operations Setup
Depots
Tanks
Suppliers
Agreements
System
Users
Currency
Company Details
Subscription
9.3 Operations (PWA)
Refuel Vehicle
Refill Tank
Manual Dip Entry
Recon (Tank Reconciliation)
9.4 Reports
Vehicles
Tanks
Users
Depots
Suppliers
Agreements
Subscription/Billing
9.5 SaaS (Super Admin)
Clients
Subscriptions
Billing
Users
Agreements
Currency API
10. Development Roadmap (Improved)
Phase 1 – Foundation (Data + IoT)
Multi-tenant Supabase schema
Supabase connection details - https://vjoujiapcisitzydurfz.supabase.co
Annon Public key - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqb3VqaWFwY2lzaXR6eWR1cmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODcyODQsImV4cCI6MjA5MDQ2MzI4NH0.PrDnfm7qaSDfauNMHLFrHqZ7G6WXp0Az4oKc4NAOQso
Service Role key - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqb3VqaWFwY2lzaXR6eWR1cmZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NzI4NCwiZXhwIjoyMDkwNDYzMjg0fQ.GiD8zUSkU1KYgdRyAWs4ZH5-vdtauFhFX26V8g7x5Ks
Password: KaokolandStromsoe@01
IoT ingestion API
Tank telemetry storage
Phase 2 – Field App (PWA)
Offline sync engine
QR workflows
OCR integration
Phase 3 – Intelligence Layer
Triple-check reconciliation engine
Anomaly detection
Alert system
Phase 4 – SaaS Platform
Multi-tenant admin
Billing engine
Subscription management
Phase 5 – Advanced AI (Future)
Predictive fuel usage
Theft pattern detection
Smart reorder optimization