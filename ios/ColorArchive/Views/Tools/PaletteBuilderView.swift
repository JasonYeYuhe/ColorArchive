import SwiftUI
import SwiftData

struct PaletteBuilderView: View {
    @Environment(ColorStore.self) var colorStore
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Palette.updatedAt, order: .reverse) private var palettes: [Palette]

    @State private var showingNew = false
    @State private var selectedPalette: Palette?
    var embedded = false

    var body: some View {
        if embedded {
            content
        } else {
            NavigationStack {
                content
            }
        }
    }

    @ViewBuilder
    private var content: some View {
        Group {
                if palettes.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "paintpalette.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.orange.opacity(0.3))
                        Text("No palettes yet")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                        Text("Create a palette to collect and export colors")
                            .font(.subheadline)
                            .foregroundStyle(.tertiary)
                        Button("Create Palette") { createPalette() }
                            .buttonStyle(.borderedProminent)
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    List {
                        ForEach(palettes) { palette in
                            NavigationLink(value: palette) {
                                paletteRow(palette)
                            }
                        }
                        .onDelete(perform: deletePalettes)
                    }
                }
            }
            .navigationTitle("Palettes")
            .toolbar {
                if !palettes.isEmpty {
                    Button { createPalette() } label: {
                        Image(systemName: "plus")
                    }
                }
            }
        .navigationDestination(for: Palette.self) { palette in
            PaletteDetailView(palette: palette)
        }
    }

    @ViewBuilder
    private func paletteRow(_ palette: Palette) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(palette.name)
                .font(.subheadline)
                .fontWeight(.medium)

            if !palette.colorIds.isEmpty {
                HStack(spacing: 0) {
                    ForEach(palette.colorIds, id: \.self) { id in
                        if let color = colorStore.color(byId: id) {
                            color.swiftUIColor
                                .frame(height: 32)
                        }
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            Text("\(palette.colorCount) colors · Updated \(palette.updatedAt.formatted(.relative(presentation: .named)))")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }

    private func createPalette() {
        let palette = Palette(name: "Palette \(palettes.count + 1)")
        modelContext.insert(palette)
        HapticManager.medium()
    }

    private func deletePalettes(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(palettes[index])
        }
    }
}

// MARK: - Palette Detail

struct PaletteDetailView: View {
    @Bindable var palette: Palette
    @Environment(ColorStore.self) var colorStore
    @State private var showingColorPicker = false
    @State private var showingExport = false

    var paletteColors: [ColorRecord] {
        palette.colorIds.compactMap { colorStore.color(byId: $0) }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Name editor
                TextField("Palette Name", text: $palette.name)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)

                // Color strip
                if !paletteColors.isEmpty {
                    HStack(spacing: 0) {
                        ForEach(paletteColors) { color in
                            color.swiftUIColor
                                .frame(height: 80)
                                .overlay(alignment: .bottom) {
                                    Text(color.hex)
                                        .font(.system(size: 9, design: .monospaced))
                                        .foregroundStyle(color.textColor)
                                        .padding(4)
                                }
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(radius: 8, y: 4)
                    .padding(.horizontal)
                }

                // Color list
                VStack(spacing: 0) {
                    ForEach(paletteColors) { color in
                        HStack(spacing: 12) {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(color.swiftUIColor)
                                .frame(width: 44, height: 44)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(color.name)
                                    .font(.subheadline)
                                Text(color.hex)
                                    .font(.caption)
                                    .monospaced()
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Button {
                                palette.removeColor(color.id)
                                HapticManager.light()
                            } label: {
                                Image(systemName: "minus.circle.fill")
                                    .foregroundStyle(.red)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        if color.id != paletteColors.last?.id {
                            Divider().padding(.leading, 72)
                        }
                    }
                }
                .background(.background, in: RoundedRectangle(cornerRadius: 12))
                .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
                .padding(.horizontal)

                // Add color button
                if !palette.isFull {
                    Button {
                        showingColorPicker = true
                    } label: {
                        Label("Add Color", systemImage: "plus.circle")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal)
                }

                // Export button
                if !paletteColors.isEmpty {
                    Button {
                        showingExport = true
                    } label: {
                        Label("Export Palette", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.primary, in: RoundedRectangle(cornerRadius: 12))
                            .foregroundStyle(.background)
                            .fontWeight(.semibold)
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle(palette.name)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .sheet(isPresented: $showingColorPicker) {
            ColorPickerSheet { color in
                palette.addColor(color.id)
                HapticManager.success()
                showingColorPicker = false
            }
        }
        .sheet(isPresented: $showingExport) {
            ExportSheet(colors: paletteColors, paletteName: palette.name)
        }
    }
}

// MARK: - Export Sheet

struct ExportSheet: View {
    let colors: [ColorRecord]
    let paletteName: String
    @State private var selectedFormat: ExportFormat = .cssVariables
    @State private var copied = false
    @Environment(\.dismiss) private var dismiss

    var exportCode: String {
        ExportFormats.export(colors, format: selectedFormat, name: paletteName.lowercased().replacingOccurrences(of: " ", with: "-"))
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Format picker
                Picker("Format", selection: $selectedFormat) {
                    ForEach(ExportFormat.allCases) { format in
                        Text(format.rawValue).tag(format)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                // Code preview
                ScrollView {
                    Text(exportCode)
                        .font(.system(.caption, design: .monospaced))
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.gray.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
                }
                .padding(.horizontal)

                // Copy button
                Button {
                    #if os(iOS)
                    UIPasteboard.general.string = exportCode
                    #elseif os(macOS)
                    NSPasteboard.general.clearContents()
                    NSPasteboard.general.setString(exportCode, forType: .string)
                    #endif
                    HapticManager.success()
                    copied = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
                } label: {
                    Label(copied ? "Copied!" : "Copy to Clipboard", systemImage: copied ? "checkmark" : "doc.on.doc")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(copied ? Color.green : Color.primary, in: RoundedRectangle(cornerRadius: 12))
                        .foregroundStyle(.background)
                        .fontWeight(.semibold)
                }
                .buttonStyle(.plain)
                .padding(.horizontal)
            }
            .padding(.vertical)
            .navigationTitle("Export")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                Button("Done") { dismiss() }
            }
        }
    }
}
