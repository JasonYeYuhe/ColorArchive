import Foundation

/// Color of the Day selection.
///
/// Algorithm v2 — golden-angle hue rotation + weighted nearest-neighbor with
/// circular hue distance. Must match `server/colors.js` and
/// `src/lib/color-of-day.ts` byte-for-byte on any date.
///
/// Integer-first arithmetic guarantees cross-platform parity (per Gemini 2.5
/// Pro review, 2026-04-19). See `docs/color-of-day-redesign.md`.
enum ColorOfDay {
    // Epoch: 2026-01-01 UTC
    // Int64 timestamp in ms, matches JS Date.UTC(2026, 0, 1) = 1767225600000.
    private static let epochMs: Int64 = 1767225600000
    private static let goldenAngleScaled: Int64 = 137508  // 137.508° × 1000
    private static let hueModScaled: Int64 = 360000       // 360° × 1000
    private static let msPerDay: Int64 = 86_400_000
    private static let wHue = 0.60
    private static let wLight = 0.25
    private static let wSat = 0.15

    /// Non-negative modulo.
    private static func mod(_ n: Int64, _ m: Int64) -> Int64 {
        let r = n % m
        return r < 0 ? r + m : r
    }

    /// Shortest angular distance on the hue wheel, 0..180.
    private static func circularHueDistance(_ a: Double, _ b: Double) -> Double {
        let diff = abs(a - b)
        return diff > 180 ? 360 - diff : diff
    }

    /// Parse "YYYY-MM-DD" → UTC midnight ms since 1970.
    /// Matches JS `Date.UTC(y, m-1, d)` exactly.
    private static func parseDateStrToUtcMs(_ dateStr: String) -> Int64? {
        let parts = dateStr.split(separator: "-")
        guard parts.count == 3,
              let y = Int(parts[0]),
              let m = Int(parts[1]),
              let d = Int(parts[2]) else { return nil }

        var c = DateComponents()
        c.year = y
        c.month = m
        c.day = d
        c.timeZone = TimeZone(identifier: "UTC")
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: "UTC")!
        guard let date = cal.date(from: c) else { return nil }
        return Int64((date.timeIntervalSince1970 * 1000).rounded())
    }

    /// Select today's color from a list of `ColorRecord`s.
    /// Filters to hero colors internally — caller passes the full catalog.
    static func pick(from colors: [ColorRecord], date: Date = Date()) -> ColorRecord? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone(identifier: "UTC")
        let dateString = formatter.string(from: date)
        return pick(from: colors, dateString: dateString)
    }

    /// Overload that takes an explicit "YYYY-MM-DD" string (used for parity
    /// testing and when the caller already has the local date).
    static func pick(from colors: [ColorRecord], dateString: String) -> ColorRecord? {
        guard let dateMs = parseDateStrToUtcMs(dateString) else { return colors.first }

        let daysSinceEpoch = (dateMs - epochMs) / msPerDay
        // Floor division for negative numerators (Swift truncates toward zero)
        let signedDays: Int64 = {
            if (dateMs - epochMs) < 0 && (dateMs - epochMs) % msPerDay != 0 {
                return daysSinceEpoch - 1
            }
            return daysSinceEpoch
        }()

        // Filter to hero palette (must match server + Next.js filter)
        let heroColors = colors.filter {
            $0.lightness >= 30 && $0.lightness <= 75 && $0.saturation >= 34
        }
        guard !heroColors.isEmpty else { return colors.first }

        let targetHueScaled = mod(signedDays * goldenAngleScaled, hueModScaled)
        let targetHue = Double(targetHueScaled) / 1000.0
        let targetLight = 42 + Double(mod(signedDays * 23, 34))    // 42..75
        let targetSat = 55 + Double(mod(signedDays * 29, 38))      // 55..92

        var best = heroColors[0]
        var bestScore = Double.infinity
        for c in heroColors {
            let dHue = circularHueDistance(Double(c.hue), targetHue) / 180.0
            let dLight = abs(Double(c.lightness) - targetLight) / 100.0
            let dSat = abs(Double(c.saturation) - targetSat) / 100.0
            let score = wHue * dHue + wLight * dLight + wSat * dSat
            if score < bestScore {
                bestScore = score
                best = c
            }
        }
        return best
    }
}
