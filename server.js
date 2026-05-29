const express = require('express');
const axios = require('axios');
const app = express();

// คลาวด์จะสุ่มพอร์ตมาให้รันอัตโนมัติผ่าน process.env.PORT ถ้าไม่มีจะใช้ 3000
const PORT = process.env.PORT || 3000; 

const CAM_USER = "admin";
const CAM_PASS = "Maple369";
const SNAPSHOT_PATH = "/images/snapshot.jpg";

// บันทึก IP หรือลิงก์ออนไลน์ของกล้องแต่ละตัว
const cameraConfig = {
    1: { ip: "192.168.1.17", port: 80 }, 
    2: { ip: "192.168.1.18", port: 80 }, 
    3: { ip: "192.168.1.19", port: 80 }, 
    4: { ip: "192.168.1.20", port: 80 }, 
    5: { ip: "192.168.1.21", port: 80 }
};

let currentCamNumber = 1;

app.get('/api/camera-stream', async (req, res) => {
    const cam = cameraConfig[currentCamNumber];
    const targetUrl = `http://${cam.ip}:${cam.port}${SNAPSHOT_PATH}`;

    try {
        const response = await axios({
            url: targetUrl,
            method: 'GET',
            responseType: 'stream',
            auth: { username: CAM_USER, password: CAM_PASS },
            timeout: 3500
        });
        res.setHeader('Content-Type', 'image/jpeg');
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Camera connection error');
    }
});

app.get('/api/switch-camera', (req, res) => {
    const camId = parseInt(req.query.id);
    if (camId >= 1 && camId <= 5) {
        currentCamNumber = camId;
        res.json({ success: true, currentCam: currentCamNumber });
    } else {
        res.json({ success: false });
    }
});

// ดึงหน้า HTML แผงควบคุมกล้อง
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ระบบคลาวด์มัลติแคมภายนอกอาคาร</title>
        <style>
            body { background-color: #111; text-align: center; font-family: sans-serif; color: white; margin: 0; padding: 20px; }
            .container { margin-top: 15px; }
            #camStatus { color: #00ffcc; font-size: 16px; margin-bottom: 20px; font-weight: bold; }
            .btn-group { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-bottom: 25px; }
            .cam-btn {
                background-color: #222; color: #aaa; border: 1px solid #444;
                padding: 10px 20px; font-size: 14px; font-weight: bold;
                cursor: pointer; border-radius: 5px; transition: all 0.2s ease-in-out;
            }
            .cam-btn.active { background-color: #00ffcc; color: #111; border-color: #00ffcc; box-shadow: 0 0 12px rgba(0,255,204,0.4); }
            img { max-width: 90%; height: auto; border: 3px solid #333; border-radius: 6px; background-color: #000; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>ระบบคลาวด์มัลติแคม (เปิดได้จากทุกที่ 100%)</h2>
            <div id="camStatus">กำลังแสดงผลวิดีโอสด: BOX CAM 1</div>
            <div class="btn-group">
                <button id="btn1" class="cam-btn active" onclick="changeCamera(1)">BOX CAM 1</button>
                <button id="btn2" class="cam-btn" onclick="changeCamera(2)">BOX CAM 2</button>
                <button id="btn3" class="cam-btn" onclick="changeCamera(3)">BOX CAM 3</button>
                <button id="btn4" class="cam-btn" onclick="changeCamera(4)">BOX CAM 4</button>
                <button id="btn5" class="cam-btn" onclick="changeCamera(5)">BOX CAM 5</button>
            </div>
            <div><img id="liveCamera" src="/api/camera-stream" alt="กำลังเรียกสัญญาณภาพกล้อง..."></div>
        </div>
        <script>
            const cameraBaseUrl = window.location.origin + "/api/camera-stream";
            const imageElement = document.getElementById("liveCamera");
            const statusElement = document.getElementById("camStatus");
            let streamTimer = null;

            function loadNextFrame() {
                const nextFrame = new Image();
                nextFrame.onload = function() { imageElement.src = this.src; streamTimer = setTimeout(loadNextFrame, 40); };
                nextFrame.onerror = function() { streamTimer = setTimeout(loadNextFrame, 1000); };
                nextFrame.src = cameraBaseUrl + "?t=" + new Date().getTime();
            }

            function changeCamera(camId) {
                clearTimeout(streamTimer);
                fetch(window.location.origin + '/api/switch-camera?id=' + camId)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            statusElement.innerText = "กำลังแสดงผลวิดีโอสด: BOX CAM " + camId;
                            const buttons = document.querySelectorAll('.cam-btn');
                            buttons.forEach((btn, index) => {
                                if ((index + 1) === camId) btn.classList.add('active');
                                else btn.classList.remove('active');
                            });
                            loadNextFrame();
                        }
                    });
            }
            window.onload = loadNextFrame;
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running globally on port ${PORT}`);
});