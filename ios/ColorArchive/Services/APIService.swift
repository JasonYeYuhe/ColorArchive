import Foundation

enum APIService {
    static let baseURL = "https://api.colorarchive.me"

    struct AuthSession: Codable {
        let user: AuthUser
        let token: String
    }

    struct AuthUser: Codable {
        let id: Int
        let email: String
        let name: String?
        let tier: String
    }

    static func requestMagicLink(email: String) async throws {
        guard let url = URL(string: "\(baseURL)/auth/magic-link") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["email": email])
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }

    static func verifyMagicLink(token: String) async throws -> AuthSession {
        guard let url = URL(string: "\(baseURL)/auth/verify?token=\(token)") else {
            throw URLError(.badURL)
        }
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(AuthSession.self, from: data)
    }
}
