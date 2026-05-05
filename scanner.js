const video = document.getElementById("preview");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startScan");
const tagSpan = document.getElementById("tagId");
const sendBtn = document.getElementById("send");
const mapBtn = document.getElementById("openMap");

let scannedTag = null;
let scanning = false;

startBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    await video.play();

    scanning = true;
    setTimeout(scanLoop, 300);
};

function enhance(imageData) {
    const d = imageData.data;

    // Adaptive thresholding
    for (let i = 0; i < d.length; i += 4) {
        const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const bw = v < 140 ? 0 : 255; // agressieve threshold
        d[i] = d[i + 1] = d[i + 2] = bw;
    }

    return imageData;
}

async function scanLoop() {
    if (!scanning) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const crop = Math.floor(Math.min(vw, vh) * 0.55);
    const x = Math.floor((vw - crop) / 2);
    const y = Math.floor((vh - crop) / 2);

    canvas.width = crop;
    canvas.height = crop;

    ctx.drawImage(video, x, y, crop, crop, 0, 0, crop, crop);

    let img = ctx.getImageData(0, 0, crop, crop);
    img = enhance(img);
    ctx.putImageData(img, 0, 0);

    try {
        const codeReader = new ZXing.BrowserQRCodeReader();
        const result = await codeReader.decodeFromImage(canvas);

        if (result && result.text) {
            scannedTag = result.text.trim();
            tagSpan.textContent = scannedTag;
            scanning = false;
            return;
        }
    } catch (e) {
        // geen scan, doorgaan
    }

    setTimeout(scanLoop, 70); // 14 scans per seconde
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

