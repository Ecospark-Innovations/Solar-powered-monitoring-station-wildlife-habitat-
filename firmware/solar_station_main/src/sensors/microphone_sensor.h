#ifndef MICROPHONE_SENSOR_H
#define MICROPHONE_SENSOR_H

#include <Arduino.h>
#include <driver/i2s.h>
#include "esp_fft.h"

class MicrophoneSensor {
private:
  bool initialized = false;
  uint32_t sampleRate = 16000;
  uint32_t bufferSize = 4096;
  int16_t* audioBuffer = nullptr;
  
  // I2S configuration
  i2s_port_t i2sPort = I2S_NUM_0;
  
public:
  MicrophoneSensor();
  ~MicrophoneSensor();
  
  bool begin(uint32_t sampleRate, uint32_t bufferSize);
  uint16_t* record(uint32_t durationMs);
  float analyzeFrequency();
  
  void detectBirdCalls();
  void detectBatEcholocation();
  
  bool isHealthy();
};

#endif // MICROPHONE_SENSOR_H
