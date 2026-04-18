/**
 * Masterbit-256: Core Security Engine
 * Uses the native Web Crypto API for client-side cryptographic operations.
 */

// 1. Generate a secure, random 16-byte salt
export function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
}

// 2. Derive a 256-bit AES-GCM key from a user password
export async function deriveMasterKey(password, salt) {
    const encoder = new TextEncoder();
    
    // First, import the user's password as raw key material
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false, // Not extractable
        ["deriveKey"]
    );

    // Next, stretch the password using PBKDF2
    // We use 600,000 iterations of SHA-256 to prevent brute-force attacks
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 600000, 
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 }, // The exact lock we are building the key for
        true, // Allow the key to be exported (temporarily) if we need to save it in memory
        ["encrypt", "decrypt"]
    );

    return key;
}
