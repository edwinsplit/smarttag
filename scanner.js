const video = document.getElementById("preview");
const startBtn = document.getElementById("startScan");
const tagSpan = document.getElementById("tagId");
const sendBtn = document.getElementById("send");
const mapBtn = document.getElementById("openMap");

let scannedTag = null;

startBtn.onclick = async () => {
    // 1. Start camera handmatig (iPhone vereist dit)
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    await video.play();

    // 2. Wacht tot camera echt draait
    await new Promise(r => setTimeout(r, 400));

    // 3. Start ZXing scanner
    const codeReader = new ZXing.BrowserQRCodeReader();

    codeReader.decodeFromVideoElement(video, (result, err) => {
        if (result) {
            scannedTag = result.text.trim();
            tagSpan.textContent = scannedTag;
        }
    });
};

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
