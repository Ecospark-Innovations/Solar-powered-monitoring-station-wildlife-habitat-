# Frontend - React Web Dashboard

## Overview

Responive React-based web dashboard for viewing real-time telemetry data, wildlife events, camera streams, and environmental trends from solar-powered monitoring stations.

## Features

- Real-time telemetry display (temperature, humidity, air quality, battery)
- Live camera stream viewer with motion detection highlights
- Wildlife event timeline and activity log
- Environmental trend graphs (daily/weekly/monthly)
- Device management and configuration
- User authentication and authorization
- Responsive design for mobile and desktop
- Dark mode support
- Data export (CSV, JSON)

## Installation

```bash
npm install
```

## Environment Configuration

Create `.env.local` file:

```
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
```

## Running

```bash
npm start
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/               # Page components
├── services/            # API services
├── hooks/               # Custom React hooks
├── context/             # Context API providers
├── utils/               # Utility functions
├── styles/              # Global styles
└── App.jsx              # Main app component
```
