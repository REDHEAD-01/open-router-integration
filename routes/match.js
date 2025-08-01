import express from "express";
import { db } from "../services/firebase.js";
import { getMatchesFromAI } from "../services/openRouter.js";
import { filterUsersByCity } from "../services/matchUtils.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing UID" });

    const userDoc = await db.collection("users").doc(uid).get();
    const surveyDoc = await db.collection("surveyAnswers").doc(uid).get();

    if (!userDoc.exists || !surveyDoc.exists) {
      return res.status(404).json({ error: "User or survey answer not found" });
    }

    const currentUser = { uid, ...userDoc.data() };
    const currentSurvey = { uid, ...surveyDoc.data() };

    const allUsersSnap = await db.collection("users").get();
    const allSurveysSnap = await db.collection("surveyAnswers").get();

    const allUsers = [];
    allUsersSnap.forEach(doc => {
      if (doc.id !== uid) {
        allUsers.push({ uid: doc.id, ...doc.data() });
      }
    });

    const allSurveys = [];
    allSurveysSnap.forEach(doc => {
      const u = allUsers.find(x => x.uid === doc.id);
      if (u && u.city?.toLowerCase() === currentUser.city?.toLowerCase()) {
        allSurveys.push({ uid: doc.id, ...doc.data(), ...u });
      }
    });

    const roomsSnap = await db.collection("availableRooms")
      .where("city", ">=", currentUser.city)
      .where("city", "<=", currentUser.city + "\uf8ff")
      .get();

    const rooms = [];
    roomsSnap.forEach(doc => {
      const room = doc.data();
      if (room.status?.toLowerCase() === "available") {
        rooms.push({ roomId: doc.id, ...room });
      }
    });

    const result = await getMatchesFromAI(currentUser, currentSurvey, allSurveys, rooms);

    await db.collection("matches").doc(uid).set(result);

    res.json({ success: true, match: result });

  } catch (err) {
    console.error("Matching Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
