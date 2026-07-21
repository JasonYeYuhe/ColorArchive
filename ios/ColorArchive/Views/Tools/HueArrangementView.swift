import SwiftUI

/// Hue Arrangement Challenge — touch port of the web screen-test game
/// (dev-plan-2026-07-21 P0-1). Tap-to-swap interaction (deliberately not
/// drag-reorder: reliable on touch, cheap to build). Chips are pinned to
/// sRGB so the puzzle matches the web version byte-for-byte on P3 iPhones.
struct HueArrangementView: View {
    @State private var chips = HueGameMath.generateChips()
    @State private var middle: [HueGameChip]
    @State private var selected: Int? = nil
    @State private var score: Int? = nil
    @State private var startFired = false

    init() {
        let generated = HueGameMath.generateChips()
        _chips = State(initialValue: generated)
        _middle = State(initialValue: HueGameMath.scrambleMiddle(generated))
    }

    private var arrangement: [HueGameChip] {
        [chips[0]] + middle + [chips[chips.count - 1]]
    }

    private func srgbColor(_ chip: HueGameChip) -> Color {
        Color(.sRGB, red: chip.red, green: chip.green, blue: chip.blue, opacity: 1)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Arrange the middle tiles into a smooth left-to-right blend. The ends are locked. Tap one tile, then tap another to swap them. A score of 0 is perfect.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                // The row
                HStack(spacing: 4) {
                    anchorTile(chips[0])
                    ForEach(middle.indices, id: \.self) { i in
                        Button {
                            handleTap(i)
                        } label: {
                            RoundedRectangle(cornerRadius: 6)
                                .fill(srgbColor(middle[i]))
                                .frame(height: 72)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 6)
                                        .strokeBorder(
                                            selected == i ? Color.primary : Color.clear,
                                            lineWidth: 3
                                        )
                                )
                                .scaleEffect(selected == i ? 1.08 : 1.0)
                        }
                        .buttonStyle(.plain)
                        .disabled(score != nil)
                        .animation(.spring(duration: 0.2), value: selected)
                    }
                    anchorTile(chips[chips.count - 1])
                }

                // Score / result
                if let score {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 8) {
                            Text("Error score: \(score)")
                                .font(.title3.weight(.semibold))
                            if score == 0 {
                                Text("🎯 Perfect")
                            }
                        }
                        Text(score == 0
                            ? "Flawless — your screen and your eyes separate this hue range cleanly."
                            : "Some tiles are out of sequence. That can be the display compressing this hue range — or simply normal person-to-person variation. This is a game, not a medical test; see a professional if you have concerns about color vision.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)

                        HStack(spacing: 12) {
                            if let cardImage = renderScoreCard(score: score) {
                                ShareLink(
                                    item: cardImage,
                                    preview: SharePreview("Hue Challenge — score \(score)", image: cardImage)
                                ) {
                                    Label("Share", systemImage: "square.and.arrow.up")
                                }
                                .buttonStyle(.bordered)
                                .simultaneousGesture(TapGesture().onEnded {
                                    // ShareLink has no completion callback — this
                                    // honestly records intent (sheet opened), not a share.
                                    AnalyticsBootstrap.capture("hue_game_share_intent", ["score": score])
                                })
                            }
                            Button {
                                resetGame()
                            } label: {
                                Label("Play again", systemImage: "arrow.counterclockwise")
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                    .padding(.top, 4)
                } else {
                    Button {
                        let s = HueGameMath.score(arrangement)
                        score = s
                        HapticManager.success()
                        AnalyticsBootstrap.capture("hue_game_completed", ["score": s])
                    } label: {
                        Text("Score my arrangement")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }

                // How it works
                VStack(alignment: .leading, spacing: 6) {
                    Text("How it works")
                        .font(.footnote.weight(.semibold))
                    Text("Twelve tiles differ only in hue, in equal perceptual steps (OKLCH). Your score is how far each neighboring pair sits from the true order — the same challenge as the classic hue-arrangement tests used by print professionals.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 8)
            }
            .padding()
        }
        .navigationTitle("Hue Challenge")
        .onAppear {
            if !startFired {
                startFired = true
                AnalyticsBootstrap.capture("hue_game_started")
            }
        }
    }

    private func anchorTile(_ chip: HueGameChip) -> some View {
        RoundedRectangle(cornerRadius: 6)
            .fill(srgbColor(chip))
            .frame(width: 22, height: 72)
            .overlay(
                Image(systemName: "lock.fill")
                    .font(.system(size: 8))
                    .foregroundStyle(.white.opacity(0.55))
            )
    }

    private func handleTap(_ index: Int) {
        HapticManager.selection()
        if let sel = selected {
            if sel != index {
                middle.swapAt(sel, index)
            }
            selected = nil
        } else {
            selected = index
        }
    }

    private func resetGame() {
        middle = HueGameMath.scrambleMiddle(chips)
        selected = nil
        score = nil
        AnalyticsBootstrap.capture("hue_game_started", ["replay": true])
    }

    // MARK: - Share card

    @MainActor
    private func renderScoreCard(score: Int) -> Image? {
        let card = HueScoreCard(arrangement: arrangement, score: score)
            .frame(width: 600, height: 340)
        let renderer = ImageRenderer(content: card)
        renderer.scale = 2.0
        #if os(iOS)
        guard let uiImage = renderer.uiImage else { return nil }
        return Image(uiImage: uiImage)
        #else
        guard let nsImage = renderer.nsImage else { return nil }
        return Image(nsImage: nsImage)
        #endif
    }
}

/// Rendered share card — styled after the web screen-test report card.
private struct HueScoreCard: View {
    let arrangement: [HueGameChip]
    let score: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 0) {
                ForEach(arrangement, id: \.trueIndex) { chip in
                    Rectangle()
                        .fill(Color(.sRGB, red: chip.red, green: chip.green, blue: chip.blue, opacity: 1))
                }
            }
            .frame(height: 10)
            .clipShape(RoundedRectangle(cornerRadius: 5))

            Text("Hue Arrangement Challenge")
                .font(.system(size: 34, weight: .semibold))
                .foregroundStyle(.white)
            Text(score == 0 ? "Error score: 0 — perfect arrangement" : "Error score: \(score)")
                .font(.system(size: 24))
                .foregroundStyle(.white.opacity(0.85))

            HStack(spacing: 6) {
                ForEach(arrangement, id: \.trueIndex) { chip in
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(.sRGB, red: chip.red, green: chip.green, blue: chip.blue, opacity: 1))
                        .frame(height: 56)
                }
            }

            Spacer()
            Text("Can you beat it? — ColorArchive on the App Store")
                .font(.system(size: 18))
                .foregroundStyle(.white.opacity(0.6))
        }
        .padding(28)
        .background(Color(.sRGB, red: 0.059, green: 0.063, blue: 0.075, opacity: 1))
    }
}
