# Firmware - Solar Wildlife Monitoring Station

## Overview

Embedded firmware for ESP32/ESP32-CAM running PlatformIO. Handles sensor data collection, power management, Wi-Fi connectivity, and camera control.

## Prerequisites

- PlatformIO CLI or VS Code PlatformIO extension
- ESP32-WROOM-32 development board
- ESP32-CAM module (optional, for camera functionality)
- USB serial adapter

## Installation

1. **Install PlatformIO**
   ```bash
   pip install platformio
   ```

2. **Clone and Navigate**
   ```bash
   cd firmware/solar_station_main
   ```

3. **Install Dependencies**
   ```bash
   pio lib install
   ```

4. **Configure WiFi Credentials**
   Edit `src/config.h` with your WiFi SSID and password.

5. **Build and Upload**
   ```bash
   pio run -t upload
   ```

## Configuration

Edit `src/config.h` for:
- Wi-Fi credentials
- API endpoint URLs
- Sensor calibration values
- Power management thresholds
- Camera resolution settings

## Project Structure

- `src/main.cpp` - Main program loop
- `src/sensors/` - Sensor drivers
- `src/power/` - Power management
- `src/wifi/` - WiFi connectivity
- `src/camera/` - Camera control
- `src/config.h` - Configuration constants
- `platformio.ini` - Build configuration

## Flashing

```bash
pio run -t upload
```

## Monitoring

View serial output:
```bash
pio device monitor
```
