#include "camera_manager.h"
#include "../config.h"

// Camera pin configuration for ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

CameraManager::CameraManager() 
  : resolution(FRAMESIZE_VGA),
    quality(CAMERA_QUALITY),
    brightness(CAMERA_BRIGHTNESS),
    contrast(CAMERA_CONTRAST),
    saturation(CAMERA_SATURATION) {
}

CameraManager::~CameraManager() {
  if (imageBuffer != nullptr) {
    free(imageBuffer);
  }
}

bool CameraManager::begin() {
  Serial.println("[CAMERA] Initializing camera...");
  
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Set frame size and quality
  if (psramFound()) {
    config.frame_size = FRAMESIZE_VGA;  // 640x480
    config.jpeg_quality = quality;
    config.fb_count = 2;  // Use PSRAM for frame buffers
  } else {
    config.frame_size = FRAMESIZE_QVGA;  // 320x240 (smaller for limited RAM)
    config.jpeg_quality = quality + 10;  // Lower quality to fit in RAM
    config.fb_count = 1;
  }
  
  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAMERA] Camera init failed with error 0x%x\n", err);
    return false;
  }
  
  // Get camera sensor
  sensor_t* s = esp_camera_sensor_get();
  if (s != nullptr) {
    // Initial settings
    s->set_brightness(s, brightness);
    s->set_contrast(s, contrast);
    s->set_saturation(s, saturation);
    s->set_framesize(s, FRAMESIZE_VGA);
    s->set_quality(s, quality);
    s->set_whitebal(s, 1);
    s->set_awb_gain(s, 1);
    s->set_wb_mode(s, 0);
    s->set_exposure_ctrl(s, 1);
    s->set_aec_value(s, 300);
    s->set_aec2(s, 0);
    s->set_ae_level(s, 0);
    s->set_agc_gain(s, 0);
    s->set_gainceiling(s, (gainceiling_t)0);
    s->set_bpc(s, 0);
    s->set_wpc(s, 1);
    s->set_raw_gma(s, 1);
    s->set_lenc(s, 1);
    s->set_hmirror(s, 0);
    s->set_vflip(s, 0);
    s->set_dcw(s, 1);
    s->set_colorbar(s, 0);
  }
  
  // Initialize IR LED pin
  pinMode(IR_LED_PIN, OUTPUT);
  digitalWrite(IR_LED_PIN, LOW);
  
  initialized = true;
  Serial.println("[CAMERA] Camera initialized successfully");
  return true;
}

uint8_t* CameraManager::captureImage() {
  if (!initialized) {
    Serial.println("[CAMERA] Camera not initialized");
    return nullptr;
  }
  
  fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("[CAMERA] Camera capture failed");
    return nullptr;
  }
  
  // Allocate buffer for image data
  if (imageBuffer != nullptr) {
    free(imageBuffer);
  }
  
  imageSize = fb->len;
  imageBuffer = (uint8_t*)malloc(imageSize);
  
  if (imageBuffer == nullptr) {
    Serial.println("[CAMERA] Memory allocation failed");
    esp_camera_fb_return(fb);
    return nullptr;
  }
  
  memcpy(imageBuffer, fb->buf, imageSize);
  esp_camera_fb_return(fb);
  
  Serial.printf("[CAMERA] Image captured (%d bytes)\n", imageSize);
  return imageBuffer;
}

uint8_t* CameraManager::captureImageWithSettings() {
  sensor_t* s = esp_camera_sensor_get();
  if (s != nullptr) {
    s->set_brightness(s, brightness);
    s->set_contrast(s, contrast);
    s->set_saturation(s, saturation);
  }
  
  return captureImage();
}

void CameraManager::setResolution(framesize_t res) {
  resolution = res;
  sensor_t* s = esp_camera_sensor_get();
  if (s != nullptr) {
    s->set_framesize(s, res);
  }
}

void CameraManager::setQuality(uint8_t q) {
  quality = q;
  sensor_t* s = esp_camera_sensor_get();
  if (s != nullptr) {
    s->set_quality(s, q);
  }
}

void CameraManager::setBrightness(int b) {
  brightness = b;
  sensor_t* s = esp_camera_sensor_get();
  if (s != nullptr) {
    s->set_brightness(s, b);
  }
}

void CameraManager::setContrast(int c) {
  contrast = c;
  sensor_t* s = esp_camera_sensor_get();
  if (s != nullptr) {
    s->set_contrast(s, c);
  }
}

void CameraManager::setSaturation(int s) {
  saturation = s;
  sensor_t* sensor = esp_camera_sensor_get();
  if (sensor != nullptr) {
    sensor->set_saturation(sensor, s);
  }
}

void CameraManager::enableNightVision() {
  digitalWrite(IR_LED_PIN, HIGH);
  Serial.println("[CAMERA] Night vision enabled");
}

void CameraManager::disableNightVision() {
  digitalWrite(IR_LED_PIN, LOW);
  Serial.println("[CAMERA] Night vision disabled");
}

void CameraManager::setIRLEDPower(uint8_t power) {
  // PWM control for IR LED (0-255)
  analogWrite(IR_LED_PIN, power);
  Serial.printf("[CAMERA] IR LED power set to %d\n", power);
}

bool CameraManager::detectMotion(uint8_t* prevFrame, uint8_t* currentFrame) {
  if (prevFrame == nullptr || currentFrame == nullptr) {
    return false;
  }
  
  // Simple motion detection: compare pixel differences
  uint32_t differenceCount = 0;
  uint32_t threshold = imageSize / 100;  // 1% of pixels changed
  
  for (size_t i = 0; i < imageSize; i++) {
    if (abs(prevFrame[i] - currentFrame[i]) > 30) {
      differenceCount++;
      if (differenceCount > threshold) {
        return true;
      }
    }
  }
  
  return false;
}

void CameraManager::startStreamServer() {
  Serial.println("[CAMERA] Starting stream server");
  // TODO: Implement MJPEG streaming over HTTP/WebSocket
}

void CameraManager::stopStreamServer() {
  Serial.println("[CAMERA] Stopping stream server");
}

size_t CameraManager::getImageSize() {
  return imageSize;
}

uint8_t* CameraManager::getImageBuffer() {
  return imageBuffer;
}

bool CameraManager::isHealthy() {
  return initialized;
}
