import { generateSalt, deriveMasterKey, encryptData, packageFile } from './crypto.js';

const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const encryptBtn = document.getElementById('encryptBtn');
const passwordInput = document.getElementById('password');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

// 1. Update the UI when a file is selected
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.classList.add('text-blue-400', 'font-bold');
    }
});

// 2. The main Encryption Process
encryptBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const password = passwordInput.value;

    if (!file || !password) {
        alert("Please select a file and enter a password.");
        return;
    }

    // UI Feedback: Show progress
    encryptBtn.disabled = true;
    encryptBtn.textContent = "LOCKING...";
    progressContainer.classList.remove('hidden');
    progressBar.style.width = "30%";

    try {
        // Step A: Prepare the key
        const salt = generateSalt();
        const masterKey = await deriveMasterKey(password, salt);
        progressBar.style.width = "60%";

        // Step B: Read the file as an ArrayBuffer
        const fileData = await file.arrayBuffer();
        
        // Step C: Encrypt
        // (Note: For massive files, we'd use streams, but this works for most docs/images)
        const { iv, ciphertext } = await encryptData(fileData, masterKey);
        progressBar.style.width = "90%";

        // Step D: Package and Download
        const finalBlob = packageFile(salt, iv, ciphertext);
        downloadFile(finalBlob, file.name + ".masterbit");

        // Success UI
        progressBar.style.width = "100%";
        encryptBtn.textContent = "SUCCESS!";
        setTimeout(() => {
            encryptBtn.disabled = false;
            encryptBtn.textContent = "ENCRYPT & DOWNLOAD";
            progressContainer.classList.add('hidden');
            progressBar.style.width = "0%";
        }, 2000);

    } catch (error) {
        console.error(error);
        alert("Encryption failed. Check console for details.");
        encryptBtn.disabled = false;
        encryptBtn.textContent = "TRY AGAIN";
    }
});

// Helper: Trigger a browser download
function downloadFile(data, filename) {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
