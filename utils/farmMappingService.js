/**
 * Farm Mapping Service
 * This service handles API calls to the backend for farm mapping functionality
 */

import { Alert } from 'react-native';

// Update this to your actual backend URL
const API_URL = 'http://192.168.0.142:3000/api';

/**
 * Get all trees from the farm mapping
 * @returns {Promise<Array>} Array of tree objects
 */
export const fetchTrees = async () => {
  try {
    const response = await fetch(`${API_URL}/trees`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trees:', error);
    throw error;
  }
};

/**
 * Get the history of a specific tree
 * @param {string|number} treeId - The ID of the tree
 * @returns {Promise<Array>} Array of tree history objects
 */
export const fetchTreeHistory = async (treeId) => {
  try {
    const response = await fetch(`${API_URL}/trees/${treeId}/history`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tree history:', error);
    throw error;
  }
};

/**
 * Add a new tree to the farm mapping
 * @param {Object} tree - The tree object to add
 * @returns {Promise<Object>} The created tree object
 */
export const addTree = async (tree) => {
  try {
    const response = await fetch(`${API_URL}/trees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tree),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding tree:', error);
    throw error;
  }
};

/**
 * Update an existing tree in the farm mapping
 * @param {string|number} treeId - The ID of the tree to update
 * @param {Object} treeData - The updated tree data
 * @returns {Promise<Object>} The updated tree object
 */
export const updateTree = async (treeId, treeData) => {
  try {
    const response = await fetch(`${API_URL}/trees/${treeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treeData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating tree:', error);
    throw error;
  }
};

/**
 * Delete a tree from the farm mapping
 * @param {string|number} treeId - The ID of the tree to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteTree = async (treeId) => {
  try {
    const response = await fetch(`${API_URL}/trees/${treeId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting tree:', error);
    throw error;
  }
};
