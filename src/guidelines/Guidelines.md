# Nurturehood Architecture & Design Guidelines

## 1. Design System & Principles
- **Clarity First**: Prioritize readability, high contrast, and accessible touch targets (min 44px) for field healthcare workers operating in varied lighting conditions.
- **Micro-Interactions**: Utilize subtle Framer Motion spring physics on interactive elements, hover states, and transitions.
- **Multilingual Support**: All user-facing strings must support the `LanguageContext` system (`t('key')`) supporting 8 regional & global languages.
- **Offline Integrity**: Design state mutations to work with local cache first and background sync when network connectivity is detected.

## 2. Component Hierarchy
- `src/components/`: Primary domain modules (Dashboard, AntenatalCare, ImmunizationTracker, HospitalNetworkConnectivity, etc.).
- `src/components/ui/`: Atomic and composite UI primitives (Button, Card, Tabs, Select, Switch, Dialog, etc.).
- `src/context/`: Global application state, themes, and localization.
