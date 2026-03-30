import SwiftUI

struct ProfileView: View {
    @Environment(ColorStore.self) var colorStore
    @Environment(FavoritesStore.self) var favoritesStore
    @State private var showingSettings = false

    var body: some View {
        NavigationStack {
            List {
                // Stats section
                Section {
                    HStack(spacing: 20) {
                        statCard(
                            value: "\(colorStore.colors.count)",
                            label: "Colors",
                            icon: "square.grid.3x3.fill",
                            color: .blue
                        )
                        statCard(
                            value: "\(favoritesStore.count)",
                            label: "Favorites",
                            icon: "heart.fill",
                            color: .red
                        )
                        if let cotd = colorStore.colorOfDay() {
                            VStack(spacing: 6) {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(cotd.swiftUIColor)
                                    .frame(width: 44, height: 44)
                                Text("Today")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                    .padding(.vertical, 8)
                }

                // Color of the Day
                if let cotd = colorStore.colorOfDay() {
                    Section("Color of the Day") {
                        NavigationLink(value: cotd) {
                            HStack(spacing: 14) {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(cotd.swiftUIColor)
                                    .frame(width: 50, height: 50)
                                    .shadow(color: cotd.swiftUIColor.opacity(0.3), radius: 4, y: 2)
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(cotd.name)
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Text("\(cotd.hex) · \(cotd.family.rawValue)")
                                        .font(.caption)
                                        .monospaced()
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }

                // Quick Actions
                Section("Quick Actions") {
                    NavigationLink {
                        FavoritesView()
                    } label: {
                        Label("My Favorites", systemImage: "heart.fill")
                    }

                    NavigationLink {
                        ToolsHomeView()
                    } label: {
                        Label("Color Tools", systemImage: "wrench.and.screwdriver.fill")
                    }
                }

                // App Info
                Section("About") {
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Label("Settings", systemImage: "gear")
                    }

                    Link(destination: URL(string: "https://colorarchive.me")!) {
                        Label("ColorArchive Web", systemImage: "globe")
                    }

                    Link(destination: URL(string: "https://colorarchive.me/support/")!) {
                        Label("Support", systemImage: "questionmark.circle")
                    }

                    Link(destination: URL(string: "https://colorarchive.me/privacy/")!) {
                        Label("Privacy Policy", systemImage: "hand.raised")
                    }
                }

                // Version
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Profile")
            .navigationDestination(for: ColorRecord.self) { color in
                ColorDetailView(color: color)
            }
        }
    }

    @ViewBuilder
    private func statCard(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}
