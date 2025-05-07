import * as tf from '@tensorflow/tfjs';
import { initTensorFlow, loadModel, preprocessImage, LABELS } from './tensorflow';

// Detection threshold for minimum confidence
const MIN_CONFIDENCE_THRESHOLD = 0.5;

// Initialize the palm detection system
let model = null;
let isInitialized = false;

export const initPalmDetection = async () => {
  try {
    if (!isInitialized) {
      await initTensorFlow();
      model = await loadModel();
      isInitialized = true;
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize palm detection:', error);
    return false;
  }
};

export const detectPalmFruit = async (imageUri) => {
  try {
    // Ensure model is initialized
    if (!isInitialized) {
      await initPalmDetection();
    }
    
    // Preprocess the image
    const { tensor: imageTensor, originalWidth, originalHeight } = await preprocessImage(imageUri);
    
    // Run inference
    const predictions = await model.executeAsync(imageTensor);
    
    // Get results - TFLite object detection models typically output:
    // - scores: [1, numBoxes] tensor of detection scores
    // - boxes: [1, numBoxes, 4] tensor of bounding boxes
    // - classes: [1, numBoxes] tensor of class indices
    // - num_detections: [1] tensor containing the number of detections
    
    // Convert tensors to arrays
    const scores = await predictions[0].data();
    const boxes = await predictions[1].data();
    const classes = await predictions[3].data(); // Note: index might be different based on your model
    
    // Clean up tensors to prevent memory leaks
    imageTensor.dispose();
    predictions.forEach(tensor => tensor.dispose());
    
    // Process results
    const detections = [];
    
    // Process each detection
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > MIN_CONFIDENCE_THRESHOLD) {
        const classId = Math.round(classes[i]);
        
        // Skip background class (usually 0)
        if (classId === 0) continue;
        
        // Get label from class ID
        const label = LABELS[classId] || 'Unknown';
        
        // Extract bounding box coordinates
        // TFLite object detection models typically output boxes in 
        // [ymin, xmin, ymax, xmax] format, normalized to [0, 1]
        const boxIndex = i * 4;
        const ymin = boxes[boxIndex] * originalHeight;
        const xmin = boxes[boxIndex + 1] * originalWidth;
        const ymax = boxes[boxIndex + 2] * originalHeight;
        const xmax = boxes[boxIndex + 3] * originalWidth;
        
        // Add detection to results
        detections.push({
          class: label,
          classId: classId,
          confidence: scores[i],
          boundingBox: {
            x: xmin,
            y: ymin,
            width: xmax - xmin,
            height: ymax - ymin,
            // Add normalized values for drawing on the image
            normalized: {
              xmin: boxes[boxIndex + 1],
              ymin: boxes[boxIndex],
              xmax: boxes[boxIndex + 3],
              ymax: boxes[boxIndex + 2],
            }
          },
        });
      }
    }
    
    // Sort detections by confidence (highest first)
    detections.sort((a, b) => b.confidence - a.confidence);
    
    return {
      detections,
      // Return the highest confidence detection as the primary result
      primaryResult: detections.length > 0 ? detections[0] : null,
      originalDimensions: {
        width: originalWidth,
        height: originalHeight
      }
    };
  } catch (error) {
    console.error('Error detecting palm fruit:', error);
    throw error;
  }
};