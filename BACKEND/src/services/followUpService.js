import axios from "axios";

const generateFollowUp = async ({
  question,
  answer,
  feedback,
  weaknesses,
  jobRole,
  difficulty,
  followUpCount,
}) => {
  const baseUrl = process.env.AI_SERVICE_URL;

  if (!baseUrl) {
    throw new Error("AI_SERVICE_URL is not configured");
  }

  const response = await axios.post(
    `${baseUrl}/generate-follow-up`,
    {
      question,
      answer,
      feedback,
      weaknesses,
      jobRole,
      difficulty,
      followUpCount,
    },
    { timeout: 60000 }
  );

  if (
    response.data?.success !== true ||
    !["next", "follow_up"].includes(response.data.action)
  ) {
    throw new Error("Invalid follow-up service response");
  }

  return response.data;
};

export { generateFollowUp };
