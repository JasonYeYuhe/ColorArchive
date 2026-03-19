const express = require("express");
const router = express.Router();
const {
  getUserPreferences,
  requireUser,
  saveUserPreferences,
} = require("../auth");

router.use(requireUser);

router.get("/", (req, res) => {
  return res.json({
    user: req.user,
  });
});

router.get("/preferences", (req, res) => {
  return res.json(getUserPreferences(req.user.id));
});

router.put("/preferences", (req, res) => {
  const { favorites = [], palette = [] } = req.body ?? {};
  return res.json(saveUserPreferences(req.user.id, { favorites, palette }));
});

module.exports = router;
