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
// 3. Encrypt the data using the derived master key
export async function encryptData(text, key) {
    // Generate a random 12-byte Initialization Vector (IV) for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);

    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedText
    );

    return {
        iv: iv,
        ciphertext: new Uint8Array(ciphertextBuffer)
    };
}
// 4. Decrypt the data
export async function decryptData(ciphertext, key, iv) {
    try {
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (e) {
        throw new Error("Decryption failed: Incorrect password or corrupted data.");
    }
}
// 5. Package everything into a single downloadable blob
export function packageFile(salt, iv, ciphertext) {
    const out = new Uint8Array(salt.length + iv.length + ciphertext.length);
    out.set(salt, 0);
    out.set(iv, salt.length);
    out.set(ciphertext, salt.length + iv.length);
    return out;
}
