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

enum AIService {
    static let baseURL = "https://api.colorarchive.me"

    static func generateMoodPalette(prompt: String) async throws -> MoodPaletteResult {
        guard let url = URL(string: "\(baseURL)/ai/mood-palette") else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["prompt": prompt])
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(MoodPaletteResult.self, from: data)
    }

    static func generateBrandPalette(industry: String?, style: String?, audience: String?, keywords: String?) async throws -> BrandPaletteResult {
        guard let url = URL(string: "\(baseURL)/ai/brand-palette") else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        var body: [String: String] = [:]
        if let industry { body["industry"] = industry }
        if let style { body["style"] = style }
        if let audience { body["audience"] = audience }
        if let keywords { body["keywords"] = keywords }
        request.httpBody = try JSONEncoder().encode(body)
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(BrandPaletteResult.self, from: data)
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
