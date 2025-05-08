import * as FileSystem from 'expo-file-system';

// Server configuration
const API_SERVER = 'http://192.168.0.142:8000'; // Use this for local server
// const API_SERVER = 'http://10.0.2.2:8000'; // Use this for Android emulator
// const API_SERVER = 'http://localhost:8000'; // Use this for iOS simulator

/**
 * Service for interacting with the Python inference API
 */
export default class PalmDetectionService {
  /**
   * Sends an image to the TensorFlow Lite model server for inference
   * @param {string} imageUri - The URI of the image to process
   * @returns {Promise<Object>} The detection results
   */
  static async detectPalmFruit(imageUri) {
    try {
      console.log('Sending image to inference server:', imageUri);
      
      // Check for valid image URI
      if (!imageUri) {
        throw new Error('Invalid image URI');
      }
      
      // Create form data for file upload
      const formData = new FormData();
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }
      
      // Get file extension from URI
      const fileExtension = imageUri.split('.').pop();
      const mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg' 
        ? 'image/jpeg' 
        : fileExtension === 'png' ? 'image/png' : 'application/octet-stream';
      
      formData.append('file', {
        uri: imageUri,
        type: mimeType,
        name: `palm_image.${fileExtension}`,
      });
      
      // Send request to inference server
      const response = await fetch(`${API_SERVER}/detect`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // Check for successful response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.message || 'Unknown error'}`);
      }
      
      // Parse response data
      const resultData = await response.json();
      console.log('Detection results:', resultData);
      
      return resultData;
    } catch (error) {
      console.error('Error in palm detection service:', error);
      throw error;
    }
  }
  
  /**
   * Checks if the inference server is reachable and ready
   * @returns {Promise<boolean>} True if server is healthy and model is loaded
   */
  static async checkServerHealth() {
    try {
      const response = await fetch(`${API_SERVER}/health`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const healthData = await response.json();
      return healthData.status === 'healthy' && healthData.model_loaded;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
  
  /**
   * Sends a base64-encoded image for inference
   * @param {string} base64Image - Base64 encoded image data
   * @returns {Promise<Object>} The detection results
   */
  static async detectWithBase64(base64Image) {
    try {
      const response = await fetch(`${API_SERVER}/detect-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in base64 detection:', error);
      throw error;
    }
  }
}