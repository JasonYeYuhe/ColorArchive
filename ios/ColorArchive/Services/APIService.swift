import Foundation

enum APIService {
    static let baseURL = "https://api.colorarchive.me"

    struct AuthUser: Codable {
        let id: Int
        let email: String
        let createdAt: String?
        let tier: String?

        enum CodingKeys: String, CodingKey {
            case id, email, tier
            case createdAt = "created_at"
        }
    }

    struct VerifyResponse: Codable {
        let ok: Bool
        let user: AuthUser
    }

    struct SessionResponse: Codable {
        let user: AuthUser?
        let auth: AuthInfo?
    }

    struct AuthInfo: Codable {
        let googleEnabled: Bool
        let analyticsAccess: Bool
        let tier: String
    }

    /// Shared URL session that persists cookies across requests (session-based auth).
    private static let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.httpCookieAcceptPolicy = .always
        config.httpCookieStorage = .shared
        return URLSession(configuration: config)
    }()

    // MARK: - Auth

    static func requestMagicLink(email: String) async throws {
        guard let url = URL(string: "\(baseURL)/auth/request-link") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: String] = ["email": email]
        request.httpBody = try JSONEncoder().encode(body)
        let (_, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }

    static func verifyMagicLink(token: String) async throws -> AuthUser {
        guard let url = URL(string: "\(baseURL)/auth/verify") else {
            throw URLError(.badURL)
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: String] = ["token": token]
        request.httpBody = try JSONEncoder().encode(body)
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        let result = try JSONDecoder().decode(VerifyResponse.self, from: data)
        return result.user
    }

    static func fetchSession() async throws -> SessionResponse {
        guard let url = URL(string: "\(baseURL)/auth/session") else {
            throw URLError(.badURL)
        }
        let (data, _) = try await session.data(from: url)
        return try JSONDecoder().decode(SessionResponse.self, from: data)
    }

    static func logout() async throws {
        guard let url = URL(string: "\(baseURL)/auth/logout") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        let (_, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }

    // MARK: - Preferences (Cloud Sync)

    struct UserPreferences: Codable {
        var favorites: [String]
        var palette: [String]
    }

    static func fetchPreferences() async throws -> UserPreferences {
        guard let url = URL(string: "\(baseURL)/me/preferences") else {
            throw URLError(.badURL)
        }
        let (data, response) = try await session.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(UserPreferences.self, from: data)
    }

    static func savePreferences(favorites: [String], palette: [String]) async throws -> UserPreferences {
        guard let url = URL(string: "\(baseURL)/me/preferences") else {
            throw URLError(.badURL)
        }
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = UserPreferences(favorites: Array(favorites.prefix(64)), palette: Array(palette.prefix(6)))
        request.httpBody = try JSONEncoder().encode(body)
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(UserPreferences.self, from: data)
    }
}
