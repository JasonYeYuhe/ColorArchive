"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import { hexToRgb, rgbToHsl } from "@/src/lib/color-convert";
import { getColorFamily } from "@/src/lib/color-filter";
import { findClosestArchiveColor, getNearestColors } from "@/src/lib/color-relationships";

export function EmbedWidget() {
  const searchParams = useSearchParams();
  const initialColor = searchParams.get("color");
  const [hex, setHex] = useState(() => {
    if (initialColor) {
      const cleaned = initialColor.replace(/^#/, "");
      if (/^[0-9A-Fa-f]{3,6}$/.test(cleaned)) {
        return `#${cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned}`.toUpperCase();
      }
    }
    return "#3B82F6";
  });
  const [inputValue, setInputValue] = useState(hex);
  const [copied, setCopied] = useState(false);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null), [rgb]);
  const family = useMemo(() => (hsl ? getColorFamily(hsl.h) : null), [hsl]);

  const closest = useMemo(() => findClosestArchiveColor(colors, hex), [hex]);
  const related = useMemo(() => {
    if (!closest) return [];
    return getNearestColors(colors, closest, 5);
  }, [closest]);

  const handleInput = useCallback(
    (value: string) => {
      setInputValue(value);
      const cleaned = value.replace(/^#/, "");
      if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
        setHex(`#${cleaned.toUpperCase()}`);
      } else if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
        const expanded = cleaned
          .split("")
          .map((c) => c + c)
          .join("");
        setHex(`#${expanded.toUpperCase()}`);
      }
    },
    [],
  );

  const copyHex = useCallback(() => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [hex]);

  useEffect(() => {
    setInputValue(hex);
  }, [hex]);

  const textColor = hsl && hsl.l < 55 ? "#fff" : "#1a1a1a";

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: 400,
        minWidth: 280,
        margin: "0 auto",
        padding: 20,
        background: "#ffffff",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Color preview swatch */}
      <div
        style={{
          width: "100%",
          height: 100,
          borderRadius: 12,
          background: hex,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
      >
        <span style={{ color: textColor, fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
          {hex}
        </span>
      </div>

      {/* Hex input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="#3B82F6"
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 15,
            fontFamily: "monospace",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            outline: "none",
            background: "#f9fafb",
            color: "#1a1a1a",
          }}
        />
        <button
          onClick={copyHex}
          style={{
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            background: copied ? "#10b981" : "#3b82f6",
            color: "#fff",
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "Copied!" : "Copy HEX"}
        </button>
      </div>

      {/* Color values */}
      {rgb && hsl && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            fontSize: 13,
            color: "#4b5563",
          }}
        >
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <span style={{ fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 2 }}>
              RGB
            </span>
            {rgb.r}, {rgb.g}, {rgb.b}
          </div>
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <span style={{ fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 2 }}>
              HSL
            </span>
            {hsl.h}, {hsl.s}%, {hsl.l}%
          </div>
        </div>
      )}

      {/* Color family */}
      {family && (
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          Color family:{" "}
          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{family}</span>
        </div>
      )}

      {/* Related archive colors */}
      {related.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
            Related colors from archive
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {related.map((c) => (
              <a
                key={c.id}
                href={`https://colorarchive.me/colors/${c.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                title={`${c.name} ${c.hex}`}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 8,
                  background: c.hex,
                  cursor: "pointer",
                  border: "1px solid rgba(0,0,0,0.06)",
                  transition: "transform 0.15s",
                  display: "block",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Powered by */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <a
          href="https://colorarchive.me?ref=embed"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: "#9ca3af",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Powered by <span style={{ color: "#6b7280", fontWeight: 700 }}>ColorArchive</span>
        </a>
      </div>
    </div>
  );
}
