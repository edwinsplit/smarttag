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
        video: { facingMode: "environment" }
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();

    scanning = true;
    scanLoop();
};

function scanLoop() {
    if (!scanning) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
        scannedTag = code.data.trim();
        tagSpan.textContent = scannedTag;
        scanning = false;
    } else {
        requestAnimationFrame(scanLoop);
    }
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

