# Scopo Product Specification

## 1. Vision & Background
Scopo is a premium, minimalist workout tracking app designed for high-performance individuals. The goal is "Progressive Overload with Zero Friction." 

## 2. Core Principles
- **Founder’s Directive:** High-end, professional, and reliable.
- **Platform:** iOS-first (React + Vite, targeting Capacitor/Native iOS).
- **UX Goal:** Minimize "Taps-to-Log." Use ghost text for previous session data.

## 3. Design System (The "Scopo Blue" Theme)
- **Primary Color:** #0047BA (Royal Blue)
- **Background:** System support (Light & Dark Mode auto-detection).
- **Typography:** San Francisco (System UI) for native iOS feel.
- **Feedback:** Use Haptic feedback for all primary logging actions.

## 4. Technical Constraints
- No complex backend until specified (use LocalStorage or Mock Data for now).
- Modular Component Architecture (keep logic and UI separate).
- No unnecessary animations; focus on speed and clarity.

# Scopo Development Task Tracker

## Project Status: Initial Scaffold Complete
Last Updated: 2026-01-31

## ✅ Completed
- Project initialization with React/Vite.
- GitHub connection and Repository sync.
- Component architecture (SearchBar, ExerciseList, WorkoutContext).
- Primary Branding (#0047BA) applied.

## ⏳ In Progress (Current Focus)
- Active Workout Session logic (`WorkoutSession.jsx`).
- Set-logging functionality with weight/rep inputs.

## 📋 Upcoming Tasks
1. [ ] Rest Timer integration (60-second countdown).
2. [ ] Post-workout Summary/Receipt view.
3. [ ] Persistence (saving session data to LocalStorage).
4. [ ] iOS Haptic Feedback triggers.
