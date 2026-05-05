
const video = document.getElementById("preview");
const canvas = document.getElementById("qr-canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startScan");
const tagSpan = document.getElementById("tagId");
const sendBtn = document.getElementById("send");
const mapBtn = document.getElementById("openMap");

let scanning = false;
let scannedTag = null;

startBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();

    scanning = true;
    setTimeout(scanLoop, 300); // wacht tot camera scherp is
};

function scanLoop() {
    if (!scanning) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    // Teken video
    ctx.drawImage(video, 0, 0, vw, vh);

    // Crop middengebied (beste voor iPhone)
    const cropSize = Math.floor(Math.min(vw, vh) * 0.6);
    const cropX = Math.floor((vw - cropSize) / 2);
    const cropY = Math.floor((vh - cropSize) / 2);

    const imageData = ctx.getImageData(cropX, cropY, cropSize, cropSize);

    // jsQR detectie
    const code = jsQR(imageData.data, cropSize, cropSize, {
        inversionAttempts: "attemptBoth" // veel beter voor donkere QR's
    });

    if (code) {
        scannedTag = code.data.trim();
        tagSpan.textContent = scannedTag;
        scanning = false;
        return;
    }

    setTimeout(scanLoop, 100); // 10 scans per seconde
}

sendBtn.onclick = async () => {
    if (!scannedTag) {
        alert("Geen SmartTag gescand.");
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

    alert("SmartTag opgeslagen!");

    mapBtn.style.display = "block";
    mapBtn.onclick = () => {
        window.location.href = "map.html";
    };
};
