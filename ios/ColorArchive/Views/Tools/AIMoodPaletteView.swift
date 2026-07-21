import SwiftUI

struct AIMoodPaletteView: View {
    @State private var prompt = ""
    @State private var isLoading = false
    @State private var result: MoodPaletteResult?
    @State private var error: String?

    let presets = ["Sunset Café", "Dark Academia", "Tropical Beach", "Nordic Winter", "Cyberpunk City", "Japanese Garden", "Desert Dunes", "Rainy London"]

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Describe a mood, scene, or vibe")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    TextField("e.g. cozy autumn library with warm lighting", text: $prompt, axis: .vertical)
                        .lineLimit(2...4)
                        .textFieldStyle(.roundedBorder)
                }
                .padding(.horizontal)

                // Presets
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(presets, id: \.self) { preset in
                            Button {
                                prompt = preset
                                generate()
                            } label: {
                                Text(preset)
                                    .font(.caption)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.gray.opacity(0.1), in: Capsule())
                                    .foregroundStyle(.secondary)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                }

                // Generate button
                Button {
                    generate()
                } label: {
                    HStack {
                        if isLoading { ProgressView().tint(.white) }
                        Text(isLoading ? "Generating..." : "Generate Palette")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(.primary, in: RoundedRectangle(cornerRadius: 12))
                    .foregroundStyle(.background)
                    .fontWeight(.semibold)
                }
                .buttonStyle(.plain)
                .disabled(prompt.isEmpty || isLoading)
                .padding(.horizontal)

                if let error {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .padding(.horizontal)
                }

                // Result
                if let result {
                    VStack(alignment: .leading, spacing: 16) {
                        Text(result.paletteName)
                            .font(.title3)
                            .fontWeight(.bold)
                            .padding(.horizontal)

                        if let tag = result.moodTag {
                            Text(tag)
                                .font(.caption)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Color.orange.opacity(0.15), in: Capsule())
                                .padding(.horizontal)
                        }

                        // Color strip
                        HStack(spacing: 0) {
                            ForEach(result.colors.indices, id: \.self) { i in
                                let c = result.colors[i]
                                if let rgb = ColorConvert.hexToRgb(c.hex) {
                                    Color(red: Double(rgb.r)/255, green: Double(rgb.g)/255, blue: Double(rgb.b)/255)
                                        .frame(height: 80)
                                }
                            }
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(radius: 8, y: 4)
                        .padding(.horizontal)

                        // Color details
                        ForEach(result.colors.indices, id: \.self) { i in
                            let c = result.colors[i]
                            HStack(spacing: 12) {
                                if let rgb = ColorConvert.hexToRgb(c.hex) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(Color(red: Double(rgb.r)/255, green: Double(rgb.g)/255, blue: Double(rgb.b)/255))
                                        .frame(width: 50, height: 50)
                                }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(c.name)
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Text(c.hex)
                                        .font(.caption)
                                        .monospaced()
                                        .foregroundStyle(.secondary)
                                    if let desc = c.description {
                                        Text(desc)
                                            .font(.caption2)
                                            .foregroundStyle(.tertiary)
                                            .lineLimit(2)
                                    }
                                }
                                Spacer()
                            }
                            .padding(.horizontal)
                        }
                    }
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("AI Mood Palette")
    }

    private func generate() {
        guard !prompt.isEmpty else { return }
        isLoading = true
        error = nil
        Task {
            do {
                result = try await AIService.generateMoodPalette(prompt: prompt)
                HapticManager.success()
            } catch let serviceError as AIServiceError {
                self.error = serviceError.errorDescription
            } catch {
                self.error = "Failed to generate. Try again."
            }
            isLoading = false
        }
    }
}

// MARK: - AI Service

struct MoodPaletteColor: Codable {
    let hex: String
    let name: String
    let description: String?
}

struct MoodPaletteResult: Codable {
    let colors: [MoodPaletteColor]
    let paletteName: String
    let moodTag: String?

    enum CodingKeys: String, CodingKey {
        case colors
        case paletteName = "palette_name"
        case moodTag = "mood_tag"
    }
}

/// Typed AI errors (dev-plan-2026-07-21 P0-3): the old code discarded the HTTP
/// status, so a daily-limit 429 was indistinguishable from a real outage.
enum AIServiceError: LocalizedError {
    case rateLimited
    case server(status: Int)
    case offline

    var errorDescription: String? {
        switch self {
        case .rateLimited:
            // iOS AI tools are Pro-gated, so this is the PRO daily limit — no upsell copy.
            return "You've used today's AI generations. The limit resets tomorrow."
        case .server:
            return "The AI service is temporarily unavailable. Please try again in a minute."
        case .offline:
            return "You're offline. Reconnect and try again."
        }
    }
}

enum AIService {
    static let baseURL = "https://api.colorarchive.org"

    private static func post<T: Decodable>(_ path: String, body: Data) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = body
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw AIServiceError.offline
        }
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIServiceError.server(status: 0)
        }
        switch httpResponse.statusCode {
        case 200:
            return try JSONDecoder().decode(T.self, from: data)
        case 429:
            throw AIServiceError.rateLimited
        default:
            throw AIServiceError.server(status: httpResponse.statusCode)
        }
    }

    static func generateMoodPalette(prompt: String) async throws -> MoodPaletteResult {
        try await post("/ai/mood-palette", body: JSONEncoder().encode(["prompt": prompt]))
    }

    static func generateBrandPalette(industry: String?, style: String?, audience: String?, keywords: String?) async throws -> BrandPaletteResult {
        var body: [String: String] = [:]
        if let industry { body["industry"] = industry }
        if let style { body["style"] = style }
        if let audience { body["audience"] = audience }
        if let keywords { body["keywords"] = keywords }
        return try await post("/ai/brand-palette", body: JSONEncoder().encode(body))
    }
}

struct BrandPaletteColor: Codable {
    let role: String
    let hex: String
    let name: String
    let rationale: String?
}

struct BrandPaletteResult: Codable {
    let palette: [BrandPaletteColor]
    let summary: String?
}
