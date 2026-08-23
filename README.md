# Solar-Powered Wildlife Monitoring Station

## Overview

A fully operational, solar-powered environmental monitoring station that doubles as a wildlife habitat with integrated Wi-Fi camera, acoustic sensors, and real-time data telemetry.

## 🌿 Core Features

- **Solar Power Management**: 3-6W solar panel with MPPT charge controller
- **Environmental Sensors**: Temperature, humidity, pressure, air quality, UV index
- **Wildlife Habitat**: Modular birdhouse, bat roost, pollinator shelter, small-mammal refuge
- **Camera System**: Wi-Fi enabled ESP32-CAM with night-vision IR LEDs
- **Acoustic Monitoring**: Wildlife sound detection and analysis
- **Data Collection**: Local + cloud dashboard with real-time streaming
- **Energy Efficient**: LiFePO₄ battery with supercapacitor buffer

## 📁 Project Structure

```
├── firmware/                    # Embedded code for ESP32/ESP32-CAM
│   ├── solar_station_main/     # Main firmware
│   ├── libraries/              # Custom libraries
│   └── configs/                # Configuration files
├── backend/                    # Cloud services & API
│   ├── server/                 # Node.js/Express API
│   ├── database/               # PostgreSQL schemas
│   └── workers/                # Background jobs
├── frontend/                   # Web dashboard
│   ├── src/                    # React components
│   └── public/                 # Static assets
├── mobile/                     # React Native mobile app
├── docs/                       # Documentation
├── hardware/                   # 3D prints, schematics, BOM
└── tests/                      # Testing suite
```

## 🚀 Quick Start

1. **Hardware Setup**: See `docs/HARDWARE_SETUP.md`
2. **Firmware Installation**: See `firmware/README.md`
3. **Backend Deployment**: See `backend/README.md`
4. **Frontend Setup**: See `frontend/README.md`

## 📊 System Architecture

### Power System
- Solar Panel: 3-6W monocrystalline
- Charge Controller: MPPT (e.g., Victron BlueSolar)
- Battery: 4S LiFePO₄ 10Ah (51.2V nominal)
- Supercapacitor: 10F buffer for peak loads

### Sensor Suite
- BME680: Environmental (temp/humidity/pressure/VOC)
- SDS011: Particulate matter (PM2.5/PM10)
- VEML6075: UV index
- INMP441: MEMS microphone for acoustic monitoring
- PIR/mmWave: Motion detection

### Computing
- Primary: ESP32-WROOM-32 (main controller)
- Camera: OV2640 on ESP32-CAM module
- Connectivity: 802.11 b/g/n Wi-Fi, optional LoRaWAN

## 🔗 API Endpoints

- `GET /api/telemetry` - Current sensor readings
- `GET /api/telemetry/history` - Historical data
- `POST /api/camera/snapshot` - Capture camera image
- `WS /api/stream/camera` - Live camera stream
- `WS /api/stream/events` - Wildlife events in real-time
- `GET /api/wildlife/events` - Timestamped wildlife activity

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md

## 📧 Contact

For questions, contact: team@ecospark-innovations.org
