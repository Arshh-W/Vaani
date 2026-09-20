/**
 * Base URL configuration for local vs production environments
 */
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://vaani-8wmy.onrender.com';

/**
 * Send extracted hand landmark features to FastAPI backend
 */
export async function predictFromFeatures(
  features: number[], 
  apiEndpoint: string = `${DEFAULT_API_URL}/predict/features`
): Promise<string | null> {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ features }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.prediction || data.result || data.text || data.label || data.sign;
  } catch (error) {
    console.error("Prediction API Error:", error);
    return null;
  }
}

/**
 * Send captured raw image blob directly to backend
 */
export async function predictFromImageBlob(
  imageBlob: Blob, 
  apiEndpoint: string = `${DEFAULT_API_URL}/predict/image`
): Promise<string | null> {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg", // Matches backend raw byte decoding
      },
      body: imageBlob,
    });

    if (!response.ok) throw new Error("Image upload failed");
    
    const data = await response.json();
    return data.prediction || data.result || data.text || data.label || data.sign;
  } catch (error) {
    console.error("Image Prediction Error:", error);
    return null;
  }
}