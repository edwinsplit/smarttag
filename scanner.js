const startBtn = document.getElementById("startScan");
const tagSpan = document.getElementById("tagId");
const sendBtn = document.getElementById("send");
const mapBtn = document.getElementById("openMap");

let scannedTag = null;

startBtn.onclick = () => {
    const html5QrCode = new Html5Qrcode("preview");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrMessage => {
            scannedTag = qrMessage.trim();
            tagSpan.textContent = scannedTag;
        }
    );
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

    // 1. POST naar Railway backend
    await fetch("https://nivo-backend-production.up.railway.app/api/ble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    // 2. tags.json update (downloadbare versie)
    const existing = await fetch("tags.json").then(r => r.json());
    existing.push(payload);

    const blob = new Blob([JSON.stringify(existing, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tags.json";
    a.click();

    alert("SmartTag opgeslagen!");

    // 3. Toon kaartknop
    mapBtn.style.display = "block";
    mapBtn.onclick = () => {
        window.location.href = "map.html";
    };
};

