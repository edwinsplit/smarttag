const startBtn = document.getElementById("startScan");
const tagSpan = document.getElementById("tagId");
const sendBtn = document.getElementById("send");
const mapBtn = document.getElementById("openMap");
const video = document.getElementById("preview");

let scannedTag = null;

startBtn.onclick = async () => {
    const codeReader = new ZXing.BrowserQRCodeReader();

    try {
        const result = await codeReader.decodeFromVideoDevice(
            null,
            "preview",
            (res, err) => {
                if (res) {
                    scannedTag = res.text.trim();
                    tagSpan.textContent = scannedTag;
                }
            }
        );
    } catch (e) {
        alert("Camera fout: " + e);
    }
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
