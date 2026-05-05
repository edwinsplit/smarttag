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
    alert("Camera functie gestart!");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        alert("Camera stream ontvangen!");

        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        alert("Camera draait!");

        const codeReader = new ZXing.BrowserQRCodeReader();

        codeReader.decodeFromVideoElement(video, (result, err) => {
            if (result) {
                alert("QR gevonden: " + result.text);
                scannedTag = result.text.trim();
                tagSpan.textContent = scannedTag;
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
    alert("Foto functie gestart!");
    photoInput.click();
};

photoInput.onchange = async () => {
    const file = photoInput.files[0];
    if (!file) return;

    alert("Foto geladen!");

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
        const codeReader = new ZXing.BrowserQRCodeReader();
        try {
            const result = await codeReader.decodeFromImage(img);
            alert("QR gevonden in foto: " + result.text);
            scannedTag = result.text.trim();
            tagSpan.textContent = scannedTag;
        } catch (e) {
            alert("Geen QR gevonden in foto.");
        }
    };
};


// ------------------------------------------------------
// 3. BLE SCAN
// ------------------------------------------------------
scanBLEBtn.onclick = async () => {
    alert("BLE functie gestart!");

    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });

        alert("BLE ID gevonden: " + device.id);

        scannedTag = device.id;
        tagSpan.textContent = scannedTag;

    } catch (e) {
        alert("BLE fout: " + e);
    }
};


// ------------------------------------------------------
// 4. OPSLAAN
// ------------------------------------------------------
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

    alert("Data wordt verstuurd...");

    await fetch("https://nivo-backend-production.up.railway.app/api/ble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    alert("Opgeslagen!");
};
