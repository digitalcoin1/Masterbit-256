# Masterbit-256 Data Security 🔒

A 100% client-side, zero-knowledge file encryption platform. Masterbit-256 ensures that your data is secured using military-grade AES-256 encryption before it ever leaves your device.

## Security Architecture
This project utilizes the native Web Crypto API to ensure maximum security without relying on third-party dependencies.

* **Algorithm:** AES-GCM (256-bit)
* **Key Derivation:** PBKDF2 (SHA-256)
* **Iterations:** 600,000
* **Entropy:** Cryptographically secure pseudo-random 16-byte salts and 12-byte IVs.

## The Golden Rule
**Zero-Knowledge:** We never see your password, and we never see your unencrypted files. Everything happens locally in your browser. If you lose your password, your data is mathematically unrecoverable.
