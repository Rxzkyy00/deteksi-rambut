// ⚠️ GANTI URL INI dengan URL model kamu dari Teachable Machine
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/kmWEatKxC/";

let model, webcamStream, isRunning = false;

const hairInfo = {
  "Lurus": {
    emoji: "💆",
    desc: "Rambut lurus cenderung halus dan mudah diatur. Biasanya tampak mengkilap karena minyak alami mudah menyebar dari akar ke ujung rambut."
  },
  "Bergelombang": {
    emoji: "🌊",
    desc: "Rambut bergelombang memiliki pola huruf S yang lembut. Cenderung mudah di-styling dan tidak terlalu kering maupun berminyak."
  },
  "Keriting": {
    emoji: "🌀",
    desc: "Rambut keriting memiliki spiral yang jelas. Cenderung kering karena minyak sulit mencapai ujung rambut. Butuh kelembapan ekstra."
  },
  "Sangat Keriting": {
    emoji: "☁️",
    desc: "Rambut sangat keriting (afro/coily) memiliki pola spiral sangat ketat. Sangat unik dan butuh perawatan intensif untuk menjaga kelembapan."
  }
};

// Load model
async function loadModel() {
  try {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    document.getElementById("loadingBox").style.display = "none";
    document.getElementById("btnStart").disabled = false;
    console.log("✅ Model berhasil dimuat!");
  } catch (e) {
    document.getElementById("loadingText").textContent = "❌ Gagal memuat model. Cek URL model!";
    console.error(e);
  }
}

// Switch tab
function switchTab(tab) {
  document.getElementById("tab-kamera").style.display = tab === "kamera" ? "block" : "none";
  document.getElementById("tab-upload").style.display = tab === "upload" ? "block" : "none";
  document.querySelectorAll(".tab").forEach((t, i) => {
    t.classList.toggle("active",
      (i === 0 && tab === "kamera") || (i === 1 && tab === "upload")
    );
  });
  if (tab === "upload") stopKamera();
  document.getElementById("resultBox").style.display = "none";
}

// Mulai kamera (DroidCam otomatis muncul sebagai pilihan kamera)
async function startWebcam() {
  if (!model) { alert("Model masih loading, tunggu sebentar..."); return; }

  try {
    // Minta semua device kamera yang tersedia
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === "videoinput");

    console.log("Kamera tersedia:", videoDevices.map(d => d.label));

    // Cari DroidCam otomatis
    const droidCam = videoDevices.find(d =>
      d.label.toLowerCase().includes("droidcam")
    );

    const constraints = {
      video: droidCam
        ? { deviceId: { exact: droidCam.deviceId } }
        : { facingMode: "user" } // fallback ke kamera default
    };

    webcamStream = await navigator.mediaDevices.getUserMedia(constraints);
    const video = document.getElementById("webcam");
    video.srcObject = webcamStream;

    // Sembunyikan overlay
    document.getElementById("cameraOverlay").style.display = "none";
    document.getElementById("btnStart").style.display = "none";
    document.getElementById("btnStop").style.display = "inline-block";
    document.getElementById("resultBox").style.display = "block";

    isRunning = true;
    loopDeteksi();

    // Info kamera yang dipakai
    const namaKamera = droidCam ? "DroidCam (HP)" : "Kamera default";
    console.log("✅ Menggunakan:", namaKamera);

  } catch (e) {
    alert("Gagal akses kamera!\n\nPastikan:\n1. DroidCam sudah aktif di HP & laptop\n2. Izinkan akses kamera di browser\n\nError: " + e.message);
  }
}

// Loop deteksi real-time
async function loopDeteksi() {
  if (!isRunning) return;
  const video = document.getElementById("webcam");
  if (video.readyState === 4) {
    const predictions = await model.predict(video);
    tampilkanHasil(predictions);
  }
  requestAnimationFrame(loopDeteksi);
}

// Stop kamera
function stopKamera() {
  isRunning = false;
  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
  }
  const video = document.getElementById("webcam");
  video.srcObject = null;
  document.getElementById("cameraOverlay").style.display = "flex";
  document.getElementById("btnStart").style.display = "inline-block";
  document.getElementById("btnStop").style.display = "none";
  document.getElementById("resultBox").style.display = "none";
}

// Handle upload foto
function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById("previewImg");
    img.src = e.target.result;
    img.style.display = "block";
    document.getElementById("uploadPlaceholder").style.display = "none";
    document.getElementById("btnClear").style.display = "inline-block";
    document.getElementById("btnDetect").style.display = "inline-block";
  };
  reader.readAsDataURL(file);
  document.getElementById("resultBox").style.display = "none";
}

// Hapus gambar
function clearImage() {
  const img = document.getElementById("previewImg");
  img.src = "";
  img.style.display = "none";
  document.getElementById("uploadPlaceholder").style.display = "block";
  document.getElementById("btnClear").style.display = "none";
  document.getElementById("btnDetect").style.display = "none";
  document.getElementById("fileInput").value = "";
  document.getElementById("resultBox").style.display = "none";
}

// Deteksi dari upload
async function deteksiGambar() {
  if (!model) { alert("Model masih loading..."); return; }
  const img = document.getElementById("previewImg");
  if (!img.src || img.style.display === "none") {
    alert("Upload foto dulu!"); return;
  }
  const predictions = await model.predict(img);
  tampilkanHasil(predictions);
  document.getElementById("resultBox").style.display = "block";
}

// Tampilkan hasil deteksi
function tampilkanHasil(predictions) {
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  const top = sorted[0];
  const info = hairInfo[top.className] || { emoji: "💇", desc: "Tipe rambut terdeteksi." };

  document.getElementById("resultEmoji").textContent = info.emoji;
  document.getElementById("resultName").textContent = top.className;
  document.getElementById("resultPct").textContent = (top.probability * 100).toFixed(1) + "%";
  document.getElementById("resultDesc").textContent = info.desc;

  const barContainer = document.getElementById("barContainer");
  barContainer.innerHTML = "";
  predictions.forEach((p, i) => {
    const pct = (p.probability * 100).toFixed(1);
    barContainer.innerHTML += `
      <div class="bar-item">
        <span class="bar-label">${p.className}</span>
        <div class="bar-bg">
          <div class="bar-fill bar-${i}" style="width:${pct}%"></div>
        </div>
        <span class="bar-pct">${pct}%</span>
      </div>`;
  });
}

// Jalankan saat halaman dibuka
loadModel();