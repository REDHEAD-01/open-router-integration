import axios from "axios";

export async function getMatchesFromAI(currentUser, currentSurvey, otherUsers, rooms) {
  const roomPref = currentSurvey.roomType?.toLowerCase() || "single";
  const maxRoommates = roomPref === "triple" ? 2 : 1;

  const prompt = `
You are a roommate matching assistant. Given the current user's survey and a list of others with surveys, return:
- One best match (or two if triple sharing)
- Other top matches (up to 5)
- One recommended room from list
Explain reason briefly per match.

JSON format:
{
  "bestMatch": [{ "name": "...", "profession": "...", "reason": "...", "score": 92 }],
  "otherMatches": [{ "name": "...", "score": 83 }, ...],
  "matchedRoom": { "roomId": "...", "location": "...", "price": ..., "photo": "...", "type": "..." }
}

Input:
Current Survey: ${JSON.stringify(currentSurvey)}
Other Users: ${JSON.stringify(otherUsers)}
Rooms: ${JSON.stringify(rooms)}
`;

  const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  }, {
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  const match = JSON.parse(response.data.choices[0].message.content);
  return match;
}
