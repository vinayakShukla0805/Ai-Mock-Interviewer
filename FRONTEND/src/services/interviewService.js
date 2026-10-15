import api from "./api";

export const getNextQuestion = async (interviewId) => {
  const response = await api.get(
    `/interviews/${interviewId}/next-question`
  );

  return response.data;
};

export const submitAnswer = async (interviewId, payload) => {
  const response = await api.post(
    `/interviews/${interviewId}/answers`,
    payload
  );

  return response.data;
};

export const completeInterview = async (interviewId) => {
  const response = await api.post(
    `/interviews/${interviewId}/complete`
  );

  return response.data;
};