document.getElementById("scanCamera").onclick = () => {
    alert("Camera-knop werkt!");
};

document.getElementById("scanPhoto").onclick = () => {
    alert("Foto-knop werkt!");
};

document.getElementById("scanBLE").onclick = () => {
    alert("BLE-knop werkt!");
};





scanCameraBtn.onclick = async () => {
    try {
        console.log("Camera starten...");

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        console.log("Camera draait:", video.videoWidth, video.videoHeight);

        const codeReader = new ZXing.BrowserQRCodeReader();

        codeReader.decodeFromVideoElement(video, (result, err) => {
            if (result) {
                scannedTag = result.text.trim();
                tagSpan.textContent = scannedTag;
            }
        });

    } catch (err) {
        alert("Camera fout: " + err);
        console.error(err);
    }
};
