#include "microphone_sensor.h"
#include "../config.h"

MicrophoneSensor::MicrophoneSensor() {
}

MicrophoneSensor::~MicrophoneSensor() {
  if (audioBuffer != nullptr) {
    free(audioBuffer);
  }
}

bool MicrophoneSensor::begin(uint32_t sr, uint32_t bs) {
  sampleRate = sr;
  bufferSize = bs;
  
  // Allocate audio buffer
  audioBuffer = (int16_t*)malloc(bufferSize * sizeof(int16_t));
  if (!audioBuffer) {
    Serial.println("Failed to allocate microphone buffer");
    return false;
  }
  
  // Configure I2S
  const i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = sampleRate,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 1024,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };
  
  if (i2s_driver_install(i2sPort, &i2s_config, 0, nullptr) != ESP_OK) {
    Serial.println("Failed to install I2S driver");
    return false;
  }
  
  // Configure I2S pins
  const i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_CLOCK_PIN,
    .ws_io_num = I2S_WS_PIN,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_DATA_PIN,
    .mck_io_num = I2S_PIN_NO_CHANGE
  };
  
  if (i2s_set_pin(i2sPort, &pin_config) != ESP_OK) {
    Serial.println("Failed to configure I2S pins");
    return false;
  }
  
  initialized = true;
  return true;
}

uint16_t* MicrophoneSensor::record(uint32_t durationMs) {
  if (!initialized || !audioBuffer) {
    return nullptr;
  }
  
  uint32_t samplesToRead = (sampleRate * durationMs) / 1000;
  size_t bytesRead = 0;
  
  esp_err_t result = i2s_read(i2sPort, audioBuffer, 
                               samplesToRead * sizeof(int16_t),
                               &bytesRead, portMAX_DELAY);
  
  if (result == ESP_OK) {
    Serial.printf("[MICROPHONE] Recorded %lu samples\n", samplesToRead);
    return (uint16_t*)audioBuffer;
  }
  
  return nullptr;
}

float MicrophoneSensor::analyzeFrequency() {
  if (!initialized || !audioBuffer) {
    return 0.0;
  }
  
  // TODO: Implement FFT analysis
  // For now, return placeholder
  return 0.0;
}

void MicrophoneSensor::detectBirdCalls() {
  // Analyze frequency range 2-10 kHz (typical for birds)
  // Look for characteristic chirp patterns
  Serial.println("[AUDIO] Analyzing for bird calls...");
}

void MicrophoneSensor::detectBatEcholocation() {
  // Analyze frequency range 20-200 kHz (ultrasonic for bats)
  // Look for repetitive chirps
  Serial.println("[AUDIO] Analyzing for bat echolocation...");
}

bool MicrophoneSensor::isHealthy() {
  return initialized && audioBuffer != nullptr;
}
