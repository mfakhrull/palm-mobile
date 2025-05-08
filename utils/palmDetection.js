import PalmDetectionService from './PalmDetectionService';

// Detection threshold for minimum confidence
const MIN_CONFIDENCE_THRESHOLD = 0.5;

// Initialize the palm detection system
let isInitialized = false;

export const initPalmDetection = async () => {
  try {
    // Check if our Python inference server is running and healthy
    const isServerHealthy = await PalmDetectionService.checkServerHealth();
    
    if (!isServerHealthy) {
      console.warn('Palm detection server is not available or model is not loaded');
      return false;
    }
    
    isInitialized = true;
    console.log('Palm detection system initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize palm detection:', error);
    return false;
  }
};

export const detectPalmFruit = async (imageUri) => {
  try {
    // Attempt initialization if not already done
    if (!isInitialized) {
      const initSuccess = await initPalmDetection();
      if (!initSuccess) {
        throw new Error('Could not initialize palm detection system');
      }
    }
    
    // Send the image to our Python inference service
    const results = await PalmDetectionService.detectPalmFruit(imageUri);
    
    // Check if we got a valid response
    if (!results.success) {
      throw new Error(results.message || 'Detection failed on server');
    }
    
    // Return results in the same format as before for compatibility
    return {
      detections: results.detections,
      primaryResult: results.primaryResult,
      originalDimensions: results.originalDimensions
    };
  } catch (error) {
    console.error('Error detecting palm fruit:', error);
    throw error;
  }
};