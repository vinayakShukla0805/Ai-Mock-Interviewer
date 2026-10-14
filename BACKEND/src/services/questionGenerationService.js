import axios from "axios";

export const generateInterviewQuestions = async (data) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/generate-questions",
      data,
      { timeout: 120000 }
    );

    if (
      response.data?.success !== true ||
      !Array.isArray(response.data.questions)
    ) {
      throw new Error("Invalid response from Python AI service");
    }

    return response.data.questions;
  } catch (error) {
    console.error(
      "Python AI service error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to generate interview questions");
  }
};
