const startBtn = document.getElementById("startScan");
const tagSpan = document.getElementById("tagId");
const sendBtn = document.getElementById("send");

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

    await fetch("https://nivo-backend-production.up.railway.app/api/ble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    alert("SmartTag opgeslagen!");
};
