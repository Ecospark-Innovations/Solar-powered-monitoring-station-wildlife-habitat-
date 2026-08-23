#ifndef CONFIG_H
#define CONFIG_H

// ============ WiFi Configuration ============
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"
#define WIFI_TIMEOUT 20000  // ms

// ============ API Configuration ============
#define API_ENDPOINT "https://api.yourdomain.com"
#define API_PORT 443
#define API_TELEMETRY_PATH "/api/telemetry"
#define API_EVENTS_PATH "/api/events"
#define DEVICE_ID "STATION_001"  // Unique station identifier
#define API_KEY "your_api_key_here"

// ============ Sensor Configuration ============
#define SENSOR_UPDATE_INTERVAL 60000  // ms (60 seconds)
#define CAMERA_CAPTURE_INTERVAL 300000  // ms (5 minutes)

// I2C Pins
#define SDA_PIN 21
#define SCL_PIN 22

// Sensor Addresses
#define BME680_ADDRESS 0x77
#define VEML6075_ADDRESS 0x10

// ============ Power Management ============
#define BATTERY_VOLTAGE_PIN 34
#define CHARGE_CONTROLLER_PIN 35
#define SOLAR_VOLTAGE_PIN 36

#define MIN_BATTERY_VOLTAGE 45.0  // 45V minimum for LiFePO4
#define MAX_BATTERY_VOLTAGE 54.6  // 54.6V maximum for 4S LiFePO4
#define CRITICAL_BATTERY 42.0    // Shut down non-essential systems

// ============ Sleep Configuration ============
#define DEEP_SLEEP_TIME_US 300000000  // 5 minutes
#define LIGHT_SLEEP_TIME_MS 10000     // 10 seconds

// ============ Camera Configuration (ESP32-CAM) ============
#define CAMERA_ENABLED true
#define CAMERA_RESOLUTION FRAMESIZE_VGA  // 640x480
#define CAMERA_QUALITY 12  // 10-63 (lower = better quality)
#define CAMERA_BRIGHTNESS 0
#define CAMERA_CONTRAST 0
#define CAMERA_SATURATION 0
#define IR_LED_PIN 4  // Infrared LED for night vision

// ============ Motion Detection ============
#define MOTION_SENSOR_PIN 13
#define MOTION_TRIGGER_THRESHOLD 50  // PIR sensitivity
#define MOTION_DEBOUNCE_TIME 500  // ms

// ============ Microphone Configuration ============
#define MICROPHONE_I2S_NUM I2S_NUM_0
#define I2S_CLOCK_PIN 26
#define I2S_DATA_PIN 25
#define I2S_WS_PIN 27
#define AUDIO_SAMPLE_RATE 16000  // Hz
#define AUDIO_BUFFER_SIZE 4096

// ============ LED Status Indicator ============
#define STATUS_LED_PIN 2
#define LED_POWER_OK 0  // Green
#define LED_WIFI_CONNECTED 1  // Blue
#define LED_DATA_UPLOADING 2  // Yellow
#define LED_ERROR 3  // Red

// ============ Debug Configuration ============
#define DEBUG_ENABLED true
#define DEBUG_BAUD_RATE 115200
#define LOG_TELEMETRY true
#define LOG_EVENTS true

#endif // CONFIG_H
