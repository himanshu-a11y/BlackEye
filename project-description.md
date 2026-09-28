# BLACK EYE

## Project Description

BLACK EYE is a full-stack cybersecurity intelligence and OSINT-style web platform built to analyze public network and identity-related information in a responsible, ethical, and structured way. The project combines a modern dark cyber dashboard with a Python FastAPI backend and modular service-based architecture, allowing users to test and review IP geolocation, phone metadata, username information, and historical analysis records.

The application is designed as a professional security dashboard with smooth user interactions, animated transitions, a command palette, responsive routing, and a secure-looking interface inspired by modern SOC and threat-intelligence platforms. It includes dedicated sections for IP geolocation, network intelligence, phone intelligence, username enumeration, historical results, settings, and project information.

The frontend is developed using React, TypeScript, Vite, and Framer Motion, while the backend uses FastAPI with SQLite for local data storage. The project is organized into clear modules such as routes, services, providers, and models, making it easy to extend with additional intelligence sources and future features.

## Real Project Structure

The current implementation includes:

- Frontend app built with React + TypeScript
- Vite development environment for fast client-side development
- Router-based dashboard navigation using React Router
- Animated boot screen and page transitions
- Command palette for quick navigation
- Protected-style dark interface and cyber-themed design
- Backend API with FastAPI endpoints for geolocation, phone, username, and history
- SQLite database setup for storing local records and results
- Provider manager architecture for gathering IP intelligence from multiple sources

## Main Modules and Features

### Frontend Modules
- Dashboard overview page
- IP Geolocation page
- Network Intelligence page
- Phone Intelligence page
- Username Enumeration page
- History and History Detail pages
- Settings page
- About page
- Boot splash and UI animation components

### Backend Modules
- app/main.py - FastAPI startup and route registration
- app/config.py - environment configuration and settings
- app/routes/geolocation.py - geolocation-related API endpoints
- app/routes/phone.py - phone metadata API routes
- app/routes/username.py - username intelligence routes
- app/routes/history.py - previous result management
- app/services/provider_manager.py - provider orchestration logic
- app/providers/ipapi.py, ipinfo.py, ipwhois.py - external intelligence providers
- app/database.py - database initialization and connection handling
- app/models/history.py - history data model

## Advantages

- Modern full-stack architecture using React and FastAPI
- Professional cyber dashboard interface with strong visual appeal
- Modular project structure that is easy to maintain and extend
- Multi-feature platform rather than a single static demo
- Includes ethical and responsible security-focused design principles
- Suitable for demonstration in academic, portfolio, and cybersecurity project work
- Compatible with local development and easy future scaling to broader deployments

## Purpose of the Project

The purpose of BLACK EYE is to provide a clean, modern, and professional platform for network intelligence and public-data analysis in an authorized and educational context. It is designed to help users understand how common cyber information gathering tasks are structured, how APIs can be integrated, and how a secure-looking dashboard can present intelligence results in a usable way.

The project is intended for ethical cybersecurity learning and testing, with a clear distinction between legitimate network analysis and unauthorized tracking or harmful activity. It aims to demonstrate real-world application development in a cybersecurity domain while maintaining a responsible and transparent approach.

## Summary

BLACK EYE is a cybersecurity intelligence dashboard that combines a dark-themed, professional UI with a full-stack architecture for IP analysis, network investigation, phone intelligence, username lookup, and result history tracking. It is a practical, modern project designed to showcase ethical cybersecurity tooling, API integration, and full-stack application development in one complete platform.
