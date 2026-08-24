# Hardware Setup Guide

## Bill of Materials (BOM)

### Electronics

| Component | Model | Quantity | Cost | Notes |
|-----------|-------|----------|------|-------|
| Microcontroller | ESP32-WROOM-32 | 1 | $10 | Main controller |
| Camera Module | OV2640 ESP32-CAM | 1 | $15 | Wi-Fi camera |
| Temperature/Humidity/Pressure | BME680 | 1 | $12 | Environmental sensor |
| PM2.5/PM10 Sensor | SDS011 | 1 | $25 | Air quality |
| UV Sensor | VEML6075 | 1 | $8 | UV Index |
| MEMS Microphone | INMP441 | 1 | $5 | Acoustic monitoring |
| Motion Sensor | PIR HC-SR501 | 1 | $3 | Motion detection |
| Solar Panel | 6W Monocrystalline | 1 | $35 | Solar power |
| Battery | 4S LiFePO₄ 10Ah | 1 | $80 | Energy storage |
| Charge Controller | Victron BlueSolar | 1 | $120 | MPPT charging |
| Supercapacitor | 10F 16V | 2 | $15 | Peak power buffer |
| IR LED | 940nm 5mm | 4 | $2 | Night vision |
| USB Cable | Micro-USB | 1 | $5 | Programming |
| Connectors | XT60, JST | 1 set | $10 | Power connections |
| Resistors | 1/4W assorted | 1 set | $5 | Circuit components |
| Capacitors | Assorted | 1 set | $5 | Circuit components |
| PCB/Breadboard | Prototyping board | 1 | $3 | Assembly |

**Total Component Cost: ~$358**

### Housing & Assembly

| Item | Quantity | Cost | Notes |
|------|----------|------|-------|
| 3D Printed Enclosure | 1 | $30 | PLA/PETG |
| Weatherproof Sealant | 1 | $5 | Silicone/caulk |
| Mounting Bracket | 1 | $10 | Stainless steel |
| Cable Glands | 4 | $8 | IP67 rated |
| Desiccant Packs | 10 | $3 | Moisture control |
| Thermal Paste | 1 | $3 | Heat dissipation |

**Total Housing Cost: ~$59**

**Total Project Cost: ~$417**

---

## Schematic & Wiring

### Power Distribution

```
Solar Panel (6W) → Charge Controller (MPPT) → Battery (4S LiFePO₄ 48V)
                                              ↓
                                         Supercapacitor (10F)
                                              ↓
                                      Voltage Regulators
                                              ↓
                        ┌─────────────────────┼─────────────────────┐
                        ↓                     ↓                     ↓
                   ESP32 (5V)          Sensors (3.3V)         Camera (5V)
```

### I2C Sensor Bus

```
ESP32 GPIO22 (SCL) ──┬─→ BME680 (0x77)
ESP32 GPIO21 (SDA) ──┼─→ VEML6075 (0x10)
                      ├─→ 10kΩ Pull-ups
                      └─→ 0.1µF Decoupling Caps
```

### Camera Connections

```
ESP32-CAM Pin Configuration:
  GPIO22 → SCL (I2C)
  GPIO26 → SDA (I2C)
  GPIO4  → IR LED (PWM)
  GPIO25 → I2S WS
  GPIO26 → I2S SCK
  GPIO27 → I2S SD (microphone)
```

### Microphone (I2S)

```
INMP441 MEMS Microphone:
  CLK → GPIO26 (I2S Clock)
  WS  → GPIO25 (Word Select)
  SD  → GPIO27 (Serial Data)
  GND → GND
  VDD → 3.3V
```

---

## Assembly Instructions

### Step 1: Prepare the Enclosure

1. **Print 3D Parts**
   - Main body (PLA or PETG for UV resistance)
   - Camera viewport cover
   - Sensor mounting plate
   - Cable entry glands

2. **Post-Processing**
   - Smooth surfaces with fine sandpaper (220-400 grit)
   - Seal with weatherproof coating (polyurethane or epoxy)
   - Test fit all components

### Step 2: Mount Solar Panel

1. Attach 6W solar panel to roof mounting bracket
2. Use stainless steel fasteners
3. Seal all holes with silicone sealant
4. Solder XT60 connector to solar panel leads

### Step 3: Install Power System

1. Mount charge controller on mounting plate
2. Connect solar panel → charge controller → battery
   - Positive (Red): Solar+ → Input+, Battery+ → Output+
   - Negative (Black): Solar- → Input-, Battery- → Output-
3. Install supercapacitor across battery terminals
4. Add circuit breaker (20A) in series
5. Use strain relief on all power cables

### Step 4: Mount Microcontroller & Camera

1. Mount ESP32 on carrier board
2. Attach ESP32-CAM module to bracket
3. Position camera viewport facing outward
4. Secure with hot glue or M2 screws

### Step 5: Connect Sensors

1. **BME680 (I2C)**
   - Wire to ESP32 GPIO21 (SDA) and GPIO22 (SCL)
   - Add 10kΩ pull-up resistors
   - Secure to mounting plate

2. **VEML6075 (I2C)**
   - Connect to same I2C bus
   - Expose to light (on external surface)

3. **SDS011 (UART)**
   - Connect TX to ESP32 GPIO16 (RX)
   - Connect RX to ESP32 GPIO17 (TX)
   - Mount in ventilated chamber

4. **INMP441 Microphone (I2S)**
   - CLK → GPIO26, WS → GPIO25, SD → GPIO27
   - Use shielded cable
   - Mount on internal PCB

5. **PIR Motion Sensor**
   - Signal → GPIO13
   - Power → 3.3V regulated output
   - Mount on external surface

6. **IR LEDs**
   - 4x 940nm LEDs in series with 100Ω resistor
   - Control via GPIO4 (PWM)
   - Mount around camera

### Step 6: Cable Management

1. Use cable ties to bundle wires
2. Use cable conduit for external runs
3. Label all connections
4. Place desiccant packs inside enclosure
5. Seal all cable entry points with silicone

### Step 7: Testing

1. **Power-up Test**
   - Check voltage at all power rails
   - Verify no shorts or loose connections

2. **Sensor Test**
   - Upload test firmware
   - Verify all sensors respond
   - Log data to serial monitor

3. **WiFi Test**
   - Connect to network
   - Verify data transmission

4. **Environmental Test**
   - Run in controlled conditions
   - Monitor for condensation
   - Verify seal integrity

---

## Pin Assignments

| ESP32 GPIO | Function | Connection |
|------------|----------|-------------|
| 2 | Status LED | RGB LED |
| 4 | IR LED Control | IR LEDs (PWM) |
| 5 | Camera PCLK | ESP32-CAM |
| 13 | Motion Sensor | PIR input |
| 16 | UART RX | SDS011 |
| 17 | UART TX | SDS011 |
| 18 | Y3 | Camera |
| 19 | Y4 | Camera |
| 21 | SDA | BME680, VEML6075 |
| 22 | SCL | BME680, VEML6075 |
| 25 | I2S WS | INMP441 |
| 26 | I2S CLK | INMP441 |
| 27 | I2S SD | INMP441 |
| 34 | ADC Battery | Voltage sensing |
| 35 | ADC Solar | Voltage sensing |
| 36 | ADC Charge | Current sensing |

---

## Power Budget

### Average Power Consumption

| Component | Active Power | Sleep Power |
|-----------|--------------|-------------|
| ESP32 | 80 mA | 10 µA |
| Camera | 200 mA | - |
| BME680 | 20 mA | 1 µA |
| SDS011 | 90 mA | 4 mA |
| VEML6075 | 1 mA | - |
| INMP441 | 15 mA | - |
| PIR | 65 µA | 65 µA |
| **Total Active** | **~406 mA** | - |
| **Total Sleep** | - | **~14 mA** |

### Runtime Calculation

- Battery: 4S LiFePO₄ 10Ah = 48V × 10Ah = 480Wh
- Average system power (50% active): (406mA + 14mA) / 2 = 210mA
- Runtime: 480Wh / (48V × 0.21A) = **47.6 hours**
- Solar charging at 6W provides ~2-3 hours equivalent runtime per sunny day

---

## Environmental Specifications

### Operating Conditions
- Temperature: -10°C to +60°C
- Humidity: 10-95% RH (non-condensing)
- Pressure: 300 hPa to 1100 hPa
- Ingress Protection: IP67 (weatherproof enclosure)

### Sensor Ranges
| Sensor | Parameter | Range | Accuracy |
|--------|-----------|-------|----------|
| BME680 | Temperature | -40 to +85°C | ±1°C |
| BME680 | Humidity | 0-100% | ±3% |
| BME680 | Pressure | 300-1100 hPa | ±1 hPa |
| SDS011 | PM2.5 | 0-500 µg/m³ | ±15% |
| SDS011 | PM10 | 0-500 µg/m³ | ±15% |
| VEML6075 | UV Index | 0-15 | ±0.5 |

---

## Calibration Procedures

### Temperature Calibration
1. Place sensor next to calibrated thermometer
2. Record reading
3. Upload calibration offset to firmware

### Humidity Calibration
1. Use salt solution methods (75% RH)
2. Record calibration point
3. Update firmware offset

### PM Sensor Calibration
1. Factory calibrated - no field adjustment
2. Ensure proper ventilation
3. Warm up for 30 seconds before readings

---

## Maintenance Schedule

| Task | Frequency | Duration |
|------|-----------|----------|
| Visual inspection | Monthly | 15 min |
| Clean camera lens | Quarterly | 10 min |
| Replace desiccant | Semi-annually | 5 min |
| Firmware update | As needed | 20 min |
| Full system test | Annually | 1 hour |

