import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var isSending = false
    @State private var sentSuccess = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Logo area
            VStack(spacing: 12) {
                Image(systemName: "paintpalette.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(.primary)
                Text("ColorArchive")
                    .font(.title)
                    .fontWeight(.bold)
                Text("Sign in to sync favorites and access Pro features")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()

            if sentSuccess {
                // Success state
                VStack(spacing: 16) {
                    Image(systemName: "envelope.badge.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.green)
                    Text("Magic link sent!")
                        .font(.headline)
                    Text("Check your email at \(email) and tap the link to sign in.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                // Email input
                VStack(spacing: 16) {
                    TextField("Email address", text: $email)
                        .textFieldStyle(.roundedBorder)
                        #if os(iOS)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        #endif
                        .autocorrectionDisabled()

                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }

                    Button {
                        sendMagicLink()
                    } label: {
                        HStack {
                            if isSending {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text(isSending ? "Sending..." : "Send Magic Link")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(.primary, in: RoundedRectangle(cornerRadius: 12))
                        .foregroundStyle(.background)
                        .fontWeight(.semibold)
                    }
                    .disabled(email.isEmpty || isSending)
                }
                .padding(.horizontal, 24)
            }

            Spacer()

            Text("By signing in you agree to our Terms of Service")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .padding(.bottom)
        }
        .navigationTitle("Sign In")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }

    private func sendMagicLink() {
        isSending = true
        errorMessage = nil
        Task {
            do {
                try await APIService.requestMagicLink(email: email)
                sentSuccess = true
            } catch {
                errorMessage = "Failed to send. Please try again."
            }
            isSending = false
        }
    }
}
