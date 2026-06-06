import SwiftUI

struct ProfileView: View {
    @Environment(ColorStore.self) var colorStore
    @Environment(FavoritesStore.self) var favoritesStore
    @Environment(RecentColorsStore.self) var recentColorsStore
    @Environment(AuthStore.self) var authStore
    @Environment(StoreManager.self) var storeManager
    @Environment(ProAccessManager.self) var proAccess
    @State private var showingSettings = false
    @State private var showingPaywall = false

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

                // Pro Status
                Section {
                    if proAccess.isPro {
                        HStack {
                            Label("Pro Active", systemImage: "crown.fill")
                                .foregroundStyle(.orange)
                            Spacer()
                            if let source = proAccess.proSource {
                                Text(source)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    } else {
                        Button {
                            AnalyticsBootstrap.capture("upgrade_clicked", ["source": "profile"])
                            showingPaywall = true
                        } label: {
                            HStack {
                                Label("Upgrade to Pro", systemImage: "crown.fill")
                                    .foregroundStyle(.orange)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                    }
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

                // Recent Colors
                if !recentColorsStore.recentIds.isEmpty {
                    Section("Recently Viewed") {
                        let recents = recentColorsStore.recentColors(from: colorStore.colors).prefix(6)
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(Array(recents)) { color in
                                    NavigationLink(value: color) {
                                        VStack(spacing: 4) {
                                            RoundedRectangle(cornerRadius: 8)
                                                .fill(color.swiftUIColor)
                                                .frame(width: 50, height: 50)
                                            Text(color.hex)
                                                .font(.system(size: 8))
                                                .monospaced()
                                                .foregroundStyle(.secondary)
                                        }
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    }
                }

                // Quick Actions
                Section("Quick Actions") {
                    NavigationLink {
                        FavoritesView(embedded: true)
                    } label: {
                        Label("My Favorites (\(favoritesStore.count))", systemImage: "heart.fill")
                    }

                    NavigationLink {
                        PaletteBuilderView(embedded: true)
                    } label: {
                        Label("My Palettes", systemImage: "paintpalette.fill")
                    }

                    NavigationLink {
                        ToolsHomeView(embedded: true)
                    } label: {
                        Label("Color Tools", systemImage: "wrench.and.screwdriver.fill")
                    }
                }

                // Account
                Section("Account") {
                    if authStore.isLoggedIn, let user = authStore.user {
                        HStack {
                            Label(user.email, systemImage: "person.crop.circle.fill")
                            Spacer()
                            if proAccess.isPro {
                                Text("Pro")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(.orange)
                            } else {
                                Text(authStore.tier)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        Button(role: .destructive) {
                            authStore.logout()
                        } label: {
                            Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    } else {
                        NavigationLink {
                            LoginView()
                        } label: {
                            Label("Sign In", systemImage: "person.crop.circle")
                        }
                    }
                }

                // App Info
                Section("About") {
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Label("Settings", systemImage: "gear")
                    }

                    Link(destination: URL(string: "https://colorarchive.org")!) {
                        Label("ColorArchive Web", systemImage: "globe")
                    }

                    Link(destination: URL(string: "https://colorarchive.org/support/")!) {
                        Label("Support", systemImage: "questionmark.circle")
                    }

                    Link(destination: URL(string: "https://colorarchive.org/privacy/")!) {
                        Label("Privacy Policy", systemImage: "hand.raised")
                    }
                }

                // Version
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "—")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Profile")
            .onAppear { authStore.checkSession() }
            .sheet(isPresented: $showingPaywall) {
                ProPaywallView()
            }
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
