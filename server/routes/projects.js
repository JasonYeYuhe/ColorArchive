const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db");
const { requireUser, getSessionUser } = require("../auth");

const FREE_PROJECT_LIMIT = 3;

function getUserTier(user) {
  return user.tier || "free";
}

function countUserProjects(userId) {
  const row = db.prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = ?").get(userId);
  return row.count;
}

// All routes below require auth (except shared view)
// Shared project view — public
router.get("/shared/:shareId", (req, res) => {
  const project = db
    .prepare(
      "SELECT id, name, tags_json, palette_json, notes, critique_json, created_at, updated_at FROM projects WHERE share_id = ?"
    )
    .get(req.params.shareId);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  return res.json({
    name: project.name,
    tags: JSON.parse(project.tags_json),
    palette: JSON.parse(project.palette_json),
    notes: project.notes,
    critique: project.critique_json ? JSON.parse(project.critique_json) : null,
    created_at: project.created_at,
    updated_at: project.updated_at,
  });
});

// Auth-required routes
router.use(requireUser);

// List user's projects
router.get("/", (req, res) => {
  const projects = db
    .prepare(
      "SELECT id, name, tags_json, palette_json, notes, share_id, critique_json, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY datetime(updated_at) DESC"
    )
    .all(req.user.id)
    .map((p) => ({
      id: p.id,
      name: p.name,
      tags: JSON.parse(p.tags_json),
      palette: JSON.parse(p.palette_json),
      notes: p.notes,
      shareId: p.share_id,
      hasCritique: !!p.critique_json,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

  return res.json({ projects });
});

// Create project
router.post("/", (req, res) => {
  const tier = getUserTier(req.user);
  const count = countUserProjects(req.user.id);

  if (tier !== "pro" && count >= FREE_PROJECT_LIMIT) {
    return res.status(403).json({
      error: `Free accounts can save up to ${FREE_PROJECT_LIMIT} projects. Upgrade to Pro for unlimited.`,
      limit: true,
      upgradeUrl: "/pro",
    });
  }

  const { name, tags = [], palette = [], notes = "" } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return res.status(400).json({ error: "Project name is required." });
  }

  const result = db
    .prepare(
      "INSERT INTO projects (user_id, name, tags_json, palette_json, notes) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      req.user.id,
      name.trim().slice(0, 100),
      JSON.stringify(Array.isArray(tags) ? tags.slice(0, 10) : []),
      JSON.stringify(Array.isArray(palette) ? palette.slice(0, 20) : []),
      typeof notes === "string" ? notes.slice(0, 2000) : ""
    );

  return res.json({ id: result.lastInsertRowid, ok: true });
});

// Update project
router.put("/:id", (req, res) => {
  const project = db
    .prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const { name, tags, palette, notes, critique } = req.body ?? {};
  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push("name = ?");
    params.push(String(name).trim().slice(0, 100));
  }
  if (tags !== undefined) {
    updates.push("tags_json = ?");
    params.push(JSON.stringify(Array.isArray(tags) ? tags.slice(0, 10) : []));
  }
  if (palette !== undefined) {
    updates.push("palette_json = ?");
    params.push(JSON.stringify(Array.isArray(palette) ? palette.slice(0, 20) : []));
  }
  if (notes !== undefined) {
    updates.push("notes = ?");
    params.push(typeof notes === "string" ? notes.slice(0, 2000) : "");
  }
  if (critique !== undefined) {
    updates.push("critique_json = ?");
    params.push(critique ? JSON.stringify(critique) : null);
  }

  if (updates.length === 0) {
    return res.json({ ok: true });
  }

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id, req.user.id);

  db.prepare(
    `UPDATE projects SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`
  ).run(...params);

  return res.json({ ok: true });
});

// Delete project
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM projects WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Project not found" });
  }

  return res.json({ ok: true });
});

// Generate share link
router.post("/:id/share", (req, res) => {
  const project = db
    .prepare("SELECT id, share_id FROM projects WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (project.share_id) {
    return res.json({ shareId: project.share_id });
  }

  const shareId = crypto.randomBytes(8).toString("hex");
  db.prepare("UPDATE projects SET share_id = ? WHERE id = ?").run(shareId, project.id);

  return res.json({ shareId });
});

module.exports = router;
