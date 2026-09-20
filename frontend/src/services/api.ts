/**
 * Send extracted hand landmark features to FastAPI backend
 */
export async function predictFromFeatures(features: number[], apiEndpoint: string = "http://localhost:8000/predict/features"): Promise<string | null> {
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
    return data.prediction;
  } catch (error) {
    console.error("Prediction API Error:", error);
    return null;
  }
}

/**
 * Upload a captured image frame to backend
 */
export async function predictFromImageBlob(imageBlob: Blob, apiEndpoint: string = "http://localhost:8000/predict/image"): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", imageBlob, "frame.jpg");

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Image upload failed");
    const data = await response.json();
    return data.prediction;
  } catch (error) {
    console.error("Image Prediction Error:", error);
    return null;
  }
}