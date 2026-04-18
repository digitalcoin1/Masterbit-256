import { generateSalt, deriveMasterKey, encryptData, decryptData, packageFile } from './crypto.js';

const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const encryptBtn = document.getElementById('encryptBtn');
const passwordInput = document.getElementById('password');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

let mode = 'encrypt'; // Default mode

// 1. Automatic Detection Logic
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = file.name;
    fileNameDisplay.classList.add('text-blue-400', 'font-bold');

    // Check if the file ends with .masterbit
    if (file.name.endsWith('.masterbit')) {
        mode = 'decrypt';
        encryptBtn.innerHTML = '<i class="fa-solid fa-lock-open mr-2"></i> DECRYPT & DOWNLOAD';
        encryptBtn.classList.replace('bg-blue-600', 'bg-green-600');
        encryptBtn.classList.replace('hover:bg-blue-500', 'hover:bg-green-500');
    } else {
        mode = 'encrypt';
        encryptBtn.innerHTML = '<i class="fa-solid fa-lock mr-2"></i> ENCRYPT & DOWNLOAD';
        encryptBtn.classList.replace('bg-green-600', 'bg-blue-600');
        encryptBtn.classList.replace('hover:bg-green-500', 'hover:bg-blue-500');
    }
};

// 2. The Execution Engine
encryptBtn.onclick = async () => {
    const file = fileInput.files[0];
    const password = passwordInput.value;

    if (!file || !password) return alert("Missing file or password!");

    encryptBtn.disabled = true;
    progressContainer.classList.remove('hidden');
    progressBar.style.width = "40%";

    try {
        const fileBuffer = await file.arrayBuffer();

        if (mode === 'encrypt') {
            // ENCRYPTION PATH
            const salt = generateSalt();
            const key = await deriveMasterKey(password, salt);
            const { iv, ciphertext } = await encryptData(fileBuffer, key);
            
            const finalPackage = packageFile(salt, iv, ciphertext);
            download(finalPackage, file.name + ".masterbit");
        } else {
            // DECRYPTION PATH
            const data = new Uint8Array(fileBuffer);
            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const ciphertext = data.slice(28);

            const key = await deriveMasterKey(password, salt);
            const decrypted = await decryptData(ciphertext, key, iv);
            
            const originalName = file.name.replace('.masterbit', '');
            download(decrypted, "decrypted_" + originalName);
        }

        progressBar.style.width = "100%";
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            encryptBtn.disabled = false;
        }, 1000);

    } catch (e) {
        alert("Authentication Failed! Wrong password or corrupted data.");
        encryptBtn.disabled = false;
        progressContainer.classList.add('hidden');
    }
};

function download(data, name) {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
              }
