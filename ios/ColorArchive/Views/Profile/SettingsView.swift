import SwiftUI

struct SettingsView: View {
    @AppStorage("colorarchive-default-format") private var defaultFormat = "HEX"
    @AppStorage("colorarchive-haptics") private var hapticsEnabled = true

    private let formats = ["HEX", "RGB", "HSL", "CMYK"]

    var body: some View {
        List {
            Section("Display") {
                Picker("Default Color Format", selection: $defaultFormat) {
                    ForEach(formats, id: \.self) { format in
                        Text(format).tag(format)
                    }
                }
            }

            Section("Interaction") {
                Toggle("Haptic Feedback", isOn: $hapticsEnabled)
            }

            Section("Data") {
                HStack {
                    Text("Colors in Archive")
                    Spacer()
                    Text("5,446")
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Text("Color Families")
                    Spacer()
                    Text("9")
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Text("Hue Roots")
                    Spacer()
                    Text("48 + 5 neutrals")
                        .foregroundStyle(.secondary)
                }
            }

            Section("About ColorArchive") {
                HStack {
                    Text("App Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Text("Build")
                    Spacer()
                    Text("2026.03")
                        .foregroundStyle(.secondary)
                }

                Link(destination: URL(string: "https://colorarchive.me/about/")!) {
                    HStack {
                        Text("About Us")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                            .foregroundStyle(.secondary)
                    }
                }

                Link(destination: URL(string: "https://colorarchive.me/terms/")!) {
                    HStack {
                        Text("Terms of Service")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("Settings")
    }
}
