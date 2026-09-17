/**
 * Build X.509 certificates in pure Node for tests — no openssl binary, no fixtures,
 * no private keys committed. Just enough DER to exercise server/apple-jws.js: EC keys,
 * ECDSA signatures, basicConstraints and the Apple marker extensions.
 *
 * Why this exists: the old apple-jws test only proved that garbage is rejected. The
 * trust anchor it guarded was itself corrupt, so NOTHING could pass, and the test
 * stayed green for months. A verifier needs a chain that must be ACCEPTED as well as
 * chains that must be refused.
 */

const crypto = require("node:crypto");

function len(n) {
  if (n < 0x80) return Buffer.from([n]);
  const bytes = [];
  for (let v = n; v > 0; v >>= 8) bytes.unshift(v & 0xff);
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}
const tlv = (tag, body) => Buffer.concat([Buffer.from([tag]), len(body.length), body]);
const seq = (...parts) => tlv(0x30, Buffer.concat(parts));
const set = (...parts) => tlv(0x31, Buffer.concat(parts));
const utf8 = (s) => tlv(0x0c, Buffer.from(s, "utf8"));
const octet = (buf) => tlv(0x04, buf);
const bitString = (buf) => tlv(0x03, Buffer.concat([Buffer.from([0]), buf]));
const explicit = (n, body) => tlv(0xa0 + n, body);
const NULL = Buffer.from([0x05, 0x00]);
const TRUE = Buffer.from([0x01, 0x01, 0xff]);

function int(n) {
  let hex = BigInt(n).toString(16);
  if (hex.length % 2) hex = "0" + hex;
  let buf = Buffer.from(hex, "hex");
  if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0]), buf]);
  return tlv(0x02, buf);
}

function oid(dotted) {
  const parts = dotted.split(".").map(Number);
  const bytes = [40 * parts[0] + parts[1]];
  for (const n of parts.slice(2)) {
    const chunk = [n & 0x7f];
    for (let v = Math.floor(n / 128); v > 0; v = Math.floor(v / 128)) chunk.unshift((v & 0x7f) | 0x80);
    bytes.push(...chunk);
  }
  return tlv(0x06, Buffer.from(bytes));
}

function time(date) {
  const iso = date.toISOString().replace(/[-:T]/g, "").slice(0, 14) + "Z"; // YYYYMMDDHHMMSSZ
  return date.getUTCFullYear() < 2050 ? tlv(0x17, Buffer.from(iso.slice(2))) : tlv(0x18, Buffer.from(iso));
}

const name = (cn) => seq(set(seq(oid("2.5.4.3"), utf8(cn))));
const ECDSA_SHA256 = seq(oid("1.2.840.10045.4.3.2"));

/** Read one DER TLV at `off`: returns { start, bodyStart, end }. */
function readTlv(buf, off) {
  let l = buf[off + 1];
  let hdr = 2;
  if (l & 0x80) {
    const nBytes = l & 0x7f;
    l = 0;
    for (let i = 0; i < nBytes; i++) l = l * 256 + buf[off + 2 + i];
    hdr += nBytes;
  }
  return { start: off, bodyStart: off + hdr, end: off + hdr + l };
}

/** The encoded subject Name of a real certificate, so a forged child can name it as issuer byte-for-byte. */
function subjectNameDer(certDer) {
  const cert = readTlv(certDer, 0);
  const tbs = readTlv(certDer, cert.bodyStart);
  let off = tbs.bodyStart;
  if (certDer[off] === 0xa0) off = readTlv(certDer, off).end; // version
  for (let i = 0; i < 4; i++) off = readTlv(certDer, off).end; // serial, sigAlg, issuer, validity
  const subject = readTlv(certDer, off);
  return certDer.subarray(subject.start, subject.end);
}

let serial = 1000;

/**
 * @param {object} o
 * @param {string} o.subject            CN of this certificate
 * @param {Buffer} o.issuerName         encoded issuer Name (name(cn) or subjectNameDer(realCert))
 * @param {crypto.KeyObject} o.publicKey
 * @param {crypto.KeyObject} o.signingKey  issuer's private key
 * @param {boolean} [o.ca]
 * @param {string[]} [o.markerOids]     extension OIDs to include (value NULL)
 * @param {Date} [o.notBefore]
 * @param {Date} [o.notAfter]
 * @returns {Buffer} DER
 */
function makeCert({ subject, issuerName, publicKey, signingKey, ca = false, markerOids = [], notBefore, notAfter }) {
  const from = notBefore || new Date(Date.now() - 86400000);
  const to = notAfter || new Date(Date.now() + 365 * 86400000);
  const extensions = [
    seq(oid("2.5.29.19"), TRUE, octet(ca ? seq(TRUE) : seq())),
    ...markerOids.map((o) => seq(oid(o), octet(NULL))),
  ];
  const tbs = seq(
    explicit(0, int(2)),
    int(serial++),
    ECDSA_SHA256,
    issuerName,
    seq(time(from), time(to)),
    name(subject),
    publicKey.export({ type: "spki", format: "der" }),
    explicit(3, seq(...extensions)),
  );
  const signature = crypto.sign("sha256", tbs, { key: signingKey, dsaEncoding: "der" });
  return seq(tbs, ECDSA_SHA256, bitString(signature));
}

const keyPair = () => crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });

const b64u = (buf) => Buffer.from(buf).toString("base64url");

/** Compact ES256 JWS with an x5c header, signed by `leafKey`. */
function signJws(payload, x5cDers, leafKey) {
  const header = { alg: "ES256", x5c: x5cDers.map((d) => Buffer.from(d).toString("base64")) };
  const input = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  const sig = crypto.sign("sha256", Buffer.from(input), { key: leafKey, dsaEncoding: "ieee-p1363" });
  return `${input}.${b64u(sig)}`;
}

module.exports = { makeCert, keyPair, name, subjectNameDer, signJws };
