import Foundation

enum SemanticSearch {
    /// Maps common search terms to color name fragments in the archive
    static let aliases: [String: [String]] = [
        // Nature & atmosphere
        "sunset": ["ember", "coral", "amber", "merlot", "ruby"],
        "ocean": ["azure", "sapphire", "cobalt", "lagoon", "teal"],
        "forest": ["moss", "leaf", "emerald", "pine", "fern"],
        "sky": ["azure", "mist", "veil", "whisper", "powder"],
        "night": ["ink", "shadow", "onyx", "coal", "deep"],
        "earth": ["ember", "clay", "rust", "sienna", "umber"],
        // Aesthetics
        "pastel": ["veil", "whisper", "mist", "pearl", "silk"],
        "neon": ["vivid", "clear", "bright"],
        "vintage": ["muted", "soft", "dusty"],
        "bold": ["vivid", "clear", "core"],
        "muted": ["muted", "soft"],
        "minimal": ["veil", "mist", "whisper", "pearl", "slate"],
        "vibrant": ["vivid", "clear", "radiant", "bloom"],
        "dreamy": ["lavender", "blush", "peony", "lilac", "veil"],
        "retro": ["muted", "amber", "sienna", "garnet", "soft"],
        "moody": ["shadow", "ink", "plum", "merlot", "slate"],
        "elegant": ["pearl", "ivory", "muted", "garnet", "onyx"],
        "luxury": ["merlot", "pearl", "soft", "garnet", "onyx"],
        "clean": ["frost", "veil", "whisper", "pearl", "ivory"],
        // Temperature
        "warm": ["crimson", "ruby", "ember", "coral", "amber", "honey"],
        "cool": ["azure", "sapphire", "cobalt", "teal", "mint"],
        "dark": ["ink", "shadow", "deep", "coal"],
        "light": ["veil", "whisper", "mist", "pearl"],
        // Seasons
        "spring": ["mint", "peony", "rose", "blossom", "lavender"],
        "autumn": ["ember", "amber", "rust", "sienna", "garnet"],
        "fall": ["ember", "amber", "rust", "sienna", "garnet"],
        "winter": ["frost", "cobalt", "mist", "slate", "azure"],
        "summer": ["coral", "citrine", "aqua", "lime", "vivid"],
        // Geography & culture
        "tropical": ["aqua", "lime", "coral", "teal", "vivid"],
        "desert": ["sand", "sienna", "amber", "rust", "clay"],
        "nordic": ["frost", "veil", "cobalt", "mist", "azure"],
        "japanese": ["moss", "ink", "plum", "muted", "ivory"],
        "coastal": ["aqua", "teal", "fog", "azure", "mist"],
        // Basic colors
        "red": ["crimson", "ruby", "garnet", "merlot", "ember"],
        "orange": ["ember", "coral", "amber", "rust", "marigold"],
        "yellow": ["amber", "citrine", "honey", "marigold", "bloom"],
        "green": ["moss", "leaf", "fern", "olive", "sage"],
        "blue": ["azure", "cobalt", "sapphire", "teal", "cerulean"],
        "purple": ["violet", "plum", "lavender", "lilac", "amethyst"],
        "pink": ["blush", "rose", "peony", "fuchsia", "coral"],
        "brown": ["sienna", "clay", "amber", "honey", "rust"],
        "gray": ["slate", "fog", "mist", "ash", "coal"],
        "grey": ["slate", "fog", "mist", "ash", "coal"],
        "black": ["ink", "onyx", "coal", "shadow", "nocturne"],
        "white": ["ivory", "pearl", "frost", "whisper", "veil"],
        // Context & style
        "tech": ["cobalt", "azure", "violet", "ink", "vivid"],
        "wedding": ["blush", "ivory", "peony", "pearl", "rose"],
        "coffee": ["sienna", "amber", "clay", "umber", "ivory"],
        "botanical": ["moss", "fern", "leaf", "sage", "olive"],
        "urban": ["ink", "slate", "cobalt", "carbon", "steel"],
        "playful": ["coral", "mint", "vivid", "bloom", "citrine"],
        // Trends
        "cottagecore": ["sage", "blush", "ivory", "rose", "moss"],
        "darkacademia": ["shadow", "sienna", "umber", "ink", "muted"],
        "zen": ["mist", "whisper", "ivory", "sage", "veil"],
        // Materials
        "marble": ["ivory", "pearl", "frost", "ash", "veil"],
        "velvet": ["plum", "merlot", "garnet", "shadow", "nocturne"],
        "denim": ["cobalt", "indigo", "azure", "slate", "shadow"],
        "linen": ["ivory", "veil", "sand", "whisper", "pearl"],
        // Gems
        "emerald": ["emerald", "jade", "teal", "clear", "vivid"],
        "sapphire": ["sapphire", "cobalt", "azure", "indigo", "clear"],
        "ruby": ["ruby", "crimson", "garnet", "merlot", "clear"],
        "amethyst": ["violet", "plum", "lavender", "orchid", "soft"],
        // Holidays
        "christmas": ["crimson", "ruby", "pine", "forest", "gold"],
        "halloween": ["ember", "rust", "amber", "onyx", "garnet"],
        // Industry
        "saas": ["cobalt", "azure", "violet", "ink", "vivid"],
        "fintech": ["cobalt", "azure", "teal", "ink", "frost"],
        "healthcare": ["azure", "mint", "teal", "frost", "cerulean"],
        // Food
        "chocolate": ["sienna", "umber", "clay", "honey", "shadow"],
        "caramel": ["amber", "honey", "sienna", "warm", "citrine"],
        "matcha": ["olive", "moss", "sage", "leaf", "muted"],
        "wine": ["merlot", "garnet", "plum", "ruby", "shadow"],
    ]

    /// Expand a search query using semantic aliases
    static func expandQuery(_ query: String) -> [String]? {
        let normalized = query.trimmingCharacters(in: .whitespaces).lowercased()
        return aliases[normalized]
    }

    /// Search colors using semantic expansion
    static func search(_ colors: [ColorRecord], query: String) -> [ColorRecord] {
        let normalized = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !normalized.isEmpty else { return [] }

        // Check for hex search
        if normalized.hasPrefix("#") {
            return colors.filter { $0.hex.lowercased().contains(normalized) }
        }

        // Try semantic expansion first
        if let fragments = expandQuery(normalized) {
            return colors.filter { color in
                let name = color.name.lowercased()
                return fragments.contains { name.contains($0) }
            }
        }

        // Fall back to name/family/hex search
        return colors.filter { color in
            color.name.lowercased().contains(normalized) ||
            color.family.rawValue.lowercased().contains(normalized) ||
            color.hex.lowercased().contains(normalized)
        }
    }
}
