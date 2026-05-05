// ------------------------------------------------------
// ELEMENTEN
// ------------------------------------------------------
const video = document.getElementById("preview");
const tagSpan = document.getElementById("tagId");

const scanCameraBtn = document.getElementById("scanCamera");
const scanPhotoBtn = document.getElementById("scanPhoto");
const scanBLEBtn = document.getElementById("scanBLE");

const photoInput = document.getElementById("photoInput");
const sendBtn = document.getElementById("send");

let scannedTag = null;


// ------------------------------------------------------
// 1. CAMERA QR SCAN
// ------------------------------------------------------
scanCameraBtn.onclick = async () => {
    alert("Camera gestart");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        alert("Camera draait");

        const codeReader = new ZXing.BrowserQRCodeReader();

        codeReader.decodeFromVideoElement(video, (result, err) => {
            if (result) {
                scannedTag = result.text.trim();
                tagSpan.textContent = scannedTag;
                alert("QR gevonden: " + scannedTag);
            }
        });

    } catch (err) {
        alert("Camera fout: " + err);
    }
};


// ------------------------------------------------------
// 2. FOTO QR SCAN
// ------------------------------------------------------
scanPhotoBtn.onclick = () => {
    photoInput.click();
};

photoInput.onchange = async () => {
    const file = photoInput.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
        const codeReader = new ZXing.BrowserQRCodeReader();
        try {
            const result = await codeReader.decodeFromImage(img);
            scannedTag = result.text.trim();
            tagSpan.textContent = scannedTag;
            alert("QR gevonden in foto: " + scannedTag);
        } catch (e) {
            alert("Geen QR gevonden in foto");
        }
    };
};


// ------------------------------------------------------
// 3. BLE SCAN
// ------------------------------------------------------
scanBLEBtn.onclick = async () => {
    alert("Bluetooth gestart");

    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });

        scannedTag = device.id;
        tagSpan.textContent = scannedTag;

        alert("BLE ID: " + scannedTag);

    } catch (e) {
        alert("BLE fout: " + e);
    }
};


// ------------------------------------------------------
// 4. OPSLAAN NAAR BACKEND
// ------------------------------------------------------
sendBtn.onclick = async () => {
    if (!scannedTag) {
        alert("Geen ID gescand");
        return;
    }

    const payload = {
        tag_id: scannedTag,
        ring: document.getElementById("ring").value,
        owner: document.getElementById("owner").value,
        timestamp: Date.now()
    };

    alert("Data wordt verstuurd...");

    await fetch("https://nivo-backend-production.up.railway.app/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    alert("Opgeslagen!");
};

