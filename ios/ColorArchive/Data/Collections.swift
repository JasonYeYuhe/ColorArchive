import Foundation

enum CollectionsData {
    static let all: [ColorCollection] = [
        ColorCollection(id: "quiet-luxury", title: "Quiet Luxury", summary: "Soft neutrals and muted warm surfaces for editorial and premium product work.", tags: ["Editorial", "Neutral", "Luxury"], colorIds: ["blush-whisper-muted", "apricot-pearl-soft", "warm-gray-mist", "taupe-gray-silk", "amber-pearl-faint"], useCases: ["Editorial landing pages", "Beauty products", "Luxury product UI"]),
        ColorCollection(id: "modern-seaside", title: "Modern Seaside", summary: "Cool aquatic tones grounded by warm sand accents.", tags: ["Nature", "Cool", "Coastal"], colorIds: ["azure-bloom-clear", "teal-silk-vivid", "aqua-pearl-muted", "cerulean-tone-bright", "amber-mist-soft"], useCases: ["Travel sites", "Hospitality brands", "Beach product UI"]),
        ColorCollection(id: "nocturne-tech", title: "Nocturne Tech", summary: "Deep ink and electric accents for dark-mode interfaces.", tags: ["Tech", "Dark", "Minimal"], colorIds: ["cobalt-ink-muted", "indigo-nocturne-vivid", "violet-shadow-clear", "azure-ink-bright", "cool-gray-ink"], useCases: ["Developer tools", "SaaS dashboards", "Dark mode UI"]),
        ColorCollection(id: "editorial-warmth", title: "Editorial Warmth", summary: "Warm ivory and terracotta tones for magazine-quality layouts.", tags: ["Editorial", "Warm", "Print"], colorIds: ["amber-pearl-muted", "coral-silk-soft", "ember-tone-clear", "warm-gray-whisper", "saffron-bloom-muted"], useCases: ["Editorial layouts", "Food brands", "Coffee shops"]),
        ColorCollection(id: "orchid-bloom", title: "Orchid Bloom", summary: "Romantic purples and soft pinks for beauty and lifestyle brands.", tags: ["Floral", "Feminine", "Beauty"], colorIds: ["orchid-bloom-vivid", "plum-silk-clear", "peony-pearl-soft", "violet-mist-muted", "blush-bloom-clear"], useCases: ["Beauty brands", "Wedding sites", "Lifestyle apps"]),
        ColorCollection(id: "forest-terrain", title: "Forest Terrain", summary: "Deep greens and earthy browns for nature-inspired design.", tags: ["Nature", "Earth", "Organic"], colorIds: ["emerald-velvet-vivid", "moss-dusk-clear", "leaf-tone-muted", "olive-shadow-soft", "amber-velvet-muted"], useCases: ["Eco brands", "Outdoor products", "Wellness apps"]),
        ColorCollection(id: "nordic-frost", title: "Nordic Frost", summary: "Icy blues and cool grays for clean Scandinavian aesthetics.", tags: ["Minimal", "Cool", "Nordic"], colorIds: ["azure-veil-faint", "cool-gray-whisper", "cobalt-mist-muted", "steel-pearl-soft", "sapphire-veil-faint"], useCases: ["SaaS products", "Fintech", "Minimalist brands"]),
        ColorCollection(id: "candy-pop", title: "Candy Pop", summary: "Vibrant saturated pastels for playful, energetic brands.", tags: ["Playful", "Vibrant", "Youth"], colorIds: ["fuchsia-bloom-vivid", "coral-silk-bright", "citrine-bloom-vivid", "mint-silk-bright", "violet-bloom-vivid"], useCases: ["Kids apps", "Gaming", "Social media"]),
        ColorCollection(id: "sunset-boulevard", title: "Sunset Boulevard", summary: "Warm gradient from coral to deep burgundy.", tags: ["Warm", "Gradient", "Dramatic"], colorIds: ["coral-bloom-vivid", "ember-silk-bright", "ruby-tone-clear", "garnet-velvet-vivid", "merlot-dusk-clear"], useCases: ["Restaurant brands", "Wine labels", "Event pages"]),
        ColorCollection(id: "monochrome-studio", title: "Monochrome Studio", summary: "Pure grayscale palette for typography-driven design.", tags: ["Minimal", "Monochrome", "Typography"], colorIds: ["true-gray-veil", "true-gray-mist", "true-gray-silk", "true-gray-velvet", "true-gray-ink"], useCases: ["Portfolio sites", "Photography", "Editorial"]),
        ColorCollection(id: "matcha-linen", title: "Matcha Linen", summary: "Soft sage and warm ivory for zen, organic aesthetics.", tags: ["Zen", "Organic", "Calm"], colorIds: ["sage-gray-pearl", "olive-pearl-muted", "moss-mist-faint", "warm-gray-pearl", "leaf-veil-faint"], useCases: ["Tea brands", "Wellness", "Japandi interiors"]),
        ColorCollection(id: "terracotta-loft", title: "Terracotta Loft", summary: "Warm clay, amber, and ivory for artisan brands.", tags: ["Artisan", "Warm", "Mediterranean"], colorIds: ["ember-tone-vivid", "coral-velvet-clear", "amber-silk-muted", "warm-gray-mist", "saffron-bloom-soft"], useCases: ["Ceramics", "Bakeries", "Artisan markets"]),
        ColorCollection(id: "ocean-abyss", title: "Ocean Abyss", summary: "Deep navy to bioluminescent cyan for immersive dark themes.", tags: ["Dark", "Ocean", "Immersive"], colorIds: ["sapphire-nocturne-vivid", "cobalt-shadow-clear", "azure-dusk-bright", "cyan-velvet-vivid", "teal-ink-muted"], useCases: ["Marine apps", "Music apps", "Gaming"]),
        ColorCollection(id: "golden-hour", title: "Golden Hour", summary: "Warm amber, peach and soft gold for lifestyle content.", tags: ["Warm", "Golden", "Lifestyle"], colorIds: ["amber-bloom-vivid", "saffron-silk-clear", "honey-pearl-muted", "apricot-bloom-soft", "citrine-silk-bright"], useCases: ["Photography", "Fashion", "Social apps"]),
        ColorCollection(id: "midnight-forest", title: "Midnight Forest", summary: "Dark emerald with ink accents for premium dark themes.", tags: ["Dark", "Forest", "Premium"], colorIds: ["emerald-ink-vivid", "jade-nocturne-clear", "moss-shadow-muted", "teal-ink-bright", "cool-gray-nocturne"], useCases: ["Luxury brands", "Banking apps", "Premium UI"]),
        ColorCollection(id: "rose-quartz", title: "Rose Quartz", summary: "Crystalline pinks and soft mauve for delicate aesthetics.", tags: ["Feminine", "Crystal", "Soft"], colorIds: ["rose-pearl-muted", "blush-mist-soft", "peony-whisper-faint", "mauve-bloom-muted", "warm-gray-pearl"], useCases: ["Jewelry brands", "Skincare", "Invitation design"]),
        ColorCollection(id: "spiced-amber", title: "Spiced Amber", summary: "Rich amber and cinnamon tones for autumn warmth.", tags: ["Autumn", "Spice", "Warm"], colorIds: ["amber-velvet-vivid", "ember-dusk-clear", "saffron-tone-bright", "vermillion-velvet-muted", "warm-gray-tone"], useCases: ["Fall campaigns", "Coffee brands", "Book covers"]),
        ColorCollection(id: "electric-mint", title: "Electric Mint", summary: "High-energy mint and cyan for modern tech brands.", tags: ["Tech", "Fresh", "Modern"], colorIds: ["mint-bloom-vivid", "cyan-silk-bright", "aqua-bloom-clear", "emerald-bloom-vivid", "teal-silk-bright"], useCases: ["Fintech", "Health tech", "Startup brands"]),
        ColorCollection(id: "arctic-dawn", title: "Arctic Dawn", summary: "Pale lavender and icy blue for ethereal cold themes.", tags: ["Cold", "Ethereal", "Pastel"], colorIds: ["iris-veil-faint", "azure-whisper-muted", "lavender-mist-soft", "cool-gray-veil", "violet-pearl-faint"], useCases: ["Spa brands", "Meditation apps", "Winter campaigns"]),
        ColorCollection(id: "desert-canyon", title: "Desert Canyon", summary: "Sandstone and rust for rugged, natural aesthetics.", tags: ["Desert", "Rugged", "Natural"], colorIds: ["ember-silk-muted", "vermillion-tone-soft", "amber-tone-muted", "taupe-gray-silk", "coral-velvet-soft"], useCases: ["Adventure brands", "National parks", "Architecture"]),
    ]

    static func collection(byId id: String) -> ColorCollection? {
        all.first { $0.id == id }
    }

    static func filtered(by tag: String) -> [ColorCollection] {
        if tag == "All" { return all }
        return all.filter { $0.tags.contains(tag) }
    }

    static var allTags: [String] {
        let tags = Set(all.flatMap(\.tags))
        return ["All"] + tags.sorted()
    }
}
