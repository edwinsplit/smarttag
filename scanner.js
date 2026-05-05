const video = document.getElementById("preview");
const tagSpan = document.getElementById("tagId");

const scanCameraBtn = document.getElementById("scanCamera");
const scanPhotoBtn = document.getElementById("scanPhoto");
const scanBLEBtn = document.getElementById("scanBLE");

const photoInput = document.getElementById("photoInput");
const sendBtn = document.getElementById("send");

let scannedTag = null;

// -------------------------------
// 1. QR SCAN VIA CAMERA
// -------------------------------
scanCameraBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    });

    video.srcObject = stream;
    video.play();

    const codeReader = new ZXing.BrowserQRCodeReader();

    codeReader.decodeFromVideoElement(video, (result, err) => {
        if (result) {
            scannedTag = result.text.trim();
            tagSpan.textContent = scannedTag;
        }
    });
};

// -------------------------------
// 2. QR SCAN VIA FOTO
// -------------------------------
scanPhotoBtn.onclick = () => photoInput.click();

photoInput.onchange = async () => {
    const file = photoInput.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
        const codeReader = new ZXing.BrowserQRCodeReader();
        const result = await codeReader.decodeFromImage(img);

        if (result) {
            scannedTag = result.text.trim();
            tagSpan.textContent = scannedTag;
        } else {
            alert("Geen QR gevonden in foto.");
        }
    };
};

// -------------------------------
// 3. SCAN SMARTTAG VIA BLUETOOTH
// -------------------------------
scanBLEBtn.onclick = async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });

        scannedTag = device.id;
        tagSpan.textContent = scannedTag;

    } catch (e) {
        alert("BLE fout: " + e);
    }
};

// -------------------------------
// OPSLAAN
// -------------------------------
sendBtn.onclick = async () => {
    if (!scannedTag) {
        alert("Geen ID gescand.");
        return;
    }

    const payload = {
        tag_id: scannedTag,
        ring: document.getElementById("ring").value,
        owner: document.getElementById("owner").value,
        scanner: "smarttag-web",
        timestamp: Date.now()
    };

    await fetch("https://nivo-backend-production.up.railway.app/api/ble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    alert("Opgeslagen!");
};
