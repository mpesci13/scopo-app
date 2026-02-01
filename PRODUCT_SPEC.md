# Scopo Product Specification

## 1. Vision & Background
Scopo is a premium, minimalist workout tracking app designed for high-performance individuals. The goal is "Progressive Overload with Zero Friction." 

## 2. Core Principles
- **Founder’s Directive:** High-end, professional, and reliable.
- **Platform:** iOS-first (React + Vite, targeting Capacitor/Native iOS).
- **UX Goal:** Minimize "Taps-to-Log." Use ghost text for previous session data.

## 5. Hierarchy & Navigation
- **Library (Home)**: The main hub. Contains a "Start Empty" button (or "Resume" if active) and a Grid of **Templates**.
- **Templates**: (Formerly Folders). Collections of specific workouts (e.g., "Hypertrophy", "Strength").
- **Workouts**: (Formerly Templates). Specific routines (e.g., "Leg Day", "Push A"). Tapping one opens the "Lobby".
- **Lobby**: A preview screen showing exercise list and last session stats before starting.

## 6. RPE System
- **Scale**: 1-5 (Inline Picker).
- **UI**: 5 small circles.
- **Touch**: Tapping a circle marks the RPE.
- **Visual**: Selected circle fills with Scopo Blue (#0047BA).
- **Density**: Row height < 60px.

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
