import { callHuggingFaceModel } from "./services/huggingFace.js";

export async function matchUserAndRooms(currentUser, allUsers, availableRooms) {
  const survey = currentUser.surveyAnswers;
  if (!survey) {
    return { error: "No survey data found." };
  }

  // Only consider users in same city
  const candidates = allUsers.filter(u =>
    u.uid !== currentUser.uid &&
    u.city?.toLowerCase().includes(currentUser.city?.toLowerCase()) &&
    u.surveyAnswers
  );

  const prompt = `
You are a matching AI. The current user has these preferences:

${JSON.stringify(survey, null, 2)}

Available candidates:
${candidates.map(u => JSON.stringify(u.surveyAnswers)).join("\n\n")}

Available rooms:
${availableRooms.map(r => JSON.stringify(r)).join("\n\n")}

Return the best roommate(s) and a recommended room.
`;

  const response = await callHuggingFaceModel(prompt);

  return {
    bestMatch: response,
    generatedAt: new Date().toISOString()
  };
}
