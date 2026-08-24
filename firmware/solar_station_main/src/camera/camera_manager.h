#ifndef CAMERA_MANAGER_H
#define CAMERA_MANAGER_H

#include <Arduino.h>
#include "esp_camera.h"
#include "esp_http_server.h"

class CameraManager {
private:
  bool initialized = false;
  camera_fb_t* fb = nullptr;
  
  // Camera configuration
  framesize_t resolution;
  uint8_t quality;
  int brightness;
  int contrast;
  int saturation;
  
  // Image buffer
  uint8_t* imageBuffer = nullptr;
  size_t imageSize = 0;
  
public:
  CameraManager();
  ~CameraManager();
  
  bool begin();
  uint8_t* captureImage();
  uint8_t* captureImageWithSettings();
  
  // Camera control
  void setResolution(framesize_t res);
  void setQuality(uint8_t q);
  void setBrightness(int b);
  void setContrast(int c);
  void setSaturation(int s);
  
  // Infrared LED control
  void enableNightVision();
  void disableNightVision();
  void setIRLEDPower(uint8_t power);
  
  // Motion detection
  bool detectMotion(uint8_t* prevFrame, uint8_t* currentFrame);
  
  // Stream management
  void startStreamServer();
  void stopStreamServer();
  
  size_t getImageSize();
  uint8_t* getImageBuffer();
  
  bool isHealthy();
};

#endif // CAMERA_MANAGER_H
