/**
 * Shared harness for EXECUTING server routes in tests.
 *
 * The repo's older server tests assert against source TEXT and say so. The
 * 2026-09-08 audit showed the cost: every one of them was green while a
 * subscription renewal destroyed lifetime purchases, because the defect was in a
 * branch none of the greps looked at. Anything that decides money or entitlement
 * should be run, not read.
 *
 * install() must be called BEFORE requiring ../db: it swaps better-sqlite3 for
 * node:sqlite in memory (so server/db.js builds the real schema against a throw-
 * away database) and stubs ../email so nothing can send.
 */

const Module = require("node:module");
const assert = require("node:assert");
const { DatabaseSync } = require("node:sqlite");

class Shim {
  constructor() {
    this.db = new DatabaseSync(":memory:");
  }
  prepare(sql) {
    return this.db.prepare(sql);
  }
  exec(sql) {
    return this.db.exec(sql);
  }
  pragma(s) {
    try {
      this.db.exec(`PRAGMA ${s}`);
    } catch {
      /* WAL and friends are meaningless in memory */
    }
  }
  transaction(fn) {
    return (...args) => {
      this.db.exec("BEGIN");
      try {
        const r = fn(...args);
        this.db.exec("COMMIT");
        return r;
      } catch (e) {
        this.db.exec("ROLLBACK");
        throw e;
      }
    };
  }
}

const emailStub = new Proxy({}, { get: () => async () => ({ ok: true }) });

let installed = false;
function install() {
  if (installed) return;
  installed = true;
  process.env.INTERNAL_WEBHOOK_SECRET = "test-secret-at-least-16-chars";
  const origLoad = Module._load;
  Module._load = function (request, ...rest) {
    if (request === "better-sqlite3") return Shim;
    if (request === "../email" || request === "./email") return emailStub;
    return origLoad.call(this, request, ...rest);
  };
}

/** A res double that records whatever the handler sent. */
function makeRes() {
  const out = { code: 200, body: null };
  const res = {
    json(b) {
      out.body = b;
      return res;
    },
    status(c) {
      out.code = c;
      return res;
    },
    send(b) {
      out.body = b;
      return res;
    },
  };
  return { res, out };
}

/** Invoke a route handler directly, bypassing router-level middleware. */
function callRoute(router, path, req) {
  const layer = router.stack.find((l) => l.route && l.route.path === path);
  assert.ok(layer, `route ${path} not found — renamed?`);
  const { res, out } = makeRes();
  layer.route.stack[layer.route.stack.length - 1].handle({ headers: {}, query: {}, ...req }, res, (e) => {
    if (e) throw e;
  });
  return out;
}

/** Invoke a router-level middleware (router.use(fn)) by its function name. */
function callMiddleware(router, fnName, req) {
  const layer = router.stack.find((l) => !l.route && l.handle && l.handle.name === fnName);
  assert.ok(layer, `middleware ${fnName} not found — renamed?`);
  const { res, out } = makeRes();
  let passed = false;
  const shaped = { headers: {}, query: {}, ...req };
  layer.handle(shaped, res, () => {
    passed = true;
  });
  return { passed, req: shaped, out };
}

module.exports = { install, callRoute, callMiddleware, makeRes };
