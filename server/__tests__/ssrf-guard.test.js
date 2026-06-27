const { test } = require("node:test");
const assert = require("node:assert");
const { isBlockedIp, assertSafeUrl } = require("../ssrf-guard");

test("isBlockedIp blocks loopback / private / link-local / metadata", () => {
  assert.equal(isBlockedIp("127.0.0.1"), true);
  assert.equal(isBlockedIp("10.1.2.3"), true);
  assert.equal(isBlockedIp("172.16.5.5"), true);
  assert.equal(isBlockedIp("192.168.0.1"), true);
  assert.equal(isBlockedIp("169.254.169.254"), true); // cloud metadata
  assert.equal(isBlockedIp("100.64.0.1"), true); // CGNAT
  assert.equal(isBlockedIp("::1"), true);
  assert.equal(isBlockedIp("fd00::1"), true);
  assert.equal(isBlockedIp("fe80::1"), true);
  assert.equal(isBlockedIp("::ffff:127.0.0.1"), true);
  // URL() normalizes ::ffff:127.0.0.1 to the hex form — must still be blocked.
  assert.equal(isBlockedIp("::ffff:7f00:1"), true);
  assert.equal(isBlockedIp("::ffff:a9fe:a9fe"), true); // 169.254.169.254 metadata
  // fe80::/10 link-local spans fe80–febf, not just literal "fe80".
  assert.equal(isBlockedIp("fe90::1"), true);
  assert.equal(isBlockedIp("febf::1"), true);
  assert.equal(isBlockedIp("ff02::1"), true); // multicast
});

test("isBlockedIp allows public addresses", () => {
  assert.equal(isBlockedIp("8.8.8.8"), false);
  assert.equal(isBlockedIp("1.1.1.1"), false);
  assert.equal(isBlockedIp("93.184.216.34"), false); // example.com
  assert.equal(isBlockedIp("2606:4700:4700::1111"), false);
});

test("isBlockedIp blocks unknown formats", () => {
  assert.equal(isBlockedIp("not-an-ip"), true);
  assert.equal(isBlockedIp(""), true);
});

test("assertSafeUrl rejects non-http(s) schemes", async () => {
  await assert.rejects(() => assertSafeUrl("file:///etc/passwd"), /BLOCKED_SCHEME/);
  await assert.rejects(() => assertSafeUrl("ftp://example.com"), /BLOCKED_SCHEME/);
});

test("assertSafeUrl rejects literal private/metadata IPs", async () => {
  await assert.rejects(() => assertSafeUrl("http://169.254.169.254/latest/meta-data/"), /BLOCKED_HOST/);
  await assert.rejects(() => assertSafeUrl("http://127.0.0.1:3001/"), /BLOCKED_HOST/);
  await assert.rejects(() => assertSafeUrl("http://10.0.0.5/"), /BLOCKED_HOST/);
  await assert.rejects(() => assertSafeUrl("https://[::1]/"), /BLOCKED_HOST/);
  await assert.rejects(() => assertSafeUrl("http://[::ffff:7f00:1]/"), /BLOCKED_HOST/);
});

test("assertSafeUrl rejects garbage", async () => {
  await assert.rejects(() => assertSafeUrl("http://"), /INVALID_URL|DNS_FAILED|BLOCKED_HOST/);
});

test("assertSafeUrl accepts a normal public host and normalizes scheme", async () => {
  const u = await assertSafeUrl("example.com");
  assert.equal(u.protocol, "https:");
  assert.equal(u.hostname, "example.com");
});
