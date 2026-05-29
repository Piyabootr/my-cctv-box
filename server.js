const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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
                padding: 12px 22px; font-size: 14px; font-weight: bold;
                cursor: pointer; border-radius: 6px; transition: all 0.2s ease-in-out;
            }
            .cam-btn.active { background-color: #00ffcc; color: #111; border-color: #00ffcc; box-shadow: 0 0 12px rgba(0,255,204,0.4); }
            img { max-width: 95%; height: auto; border: 3px solid #333; border-radius: 6px; background-color: #000; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>ระบบคลาวด์มัลติแคม (Auto Network Switch)</h2>
            <div id="camStatus">กำลังแสดงผลวิดีโอสด: BOX CAM 1</div>

            <div class="btn-group">
                <button id="btn1" class="cam-btn active" onclick="changeCamera(1)">BOX CAM 1</button>
                <button id="btn2" class="cam-btn" onclick="changeCamera(2)">BOX CAM 2</button>
                <button id="btn3" class="cam-btn" onclick="changeCamera(3)">BOX CAM 3</button>
                <button id="btn4" class="cam-btn" onclick="changeCamera(4)">BOX CAM 4</button>
                <button id="btn5" class="cam-btn" onclick="changeCamera(5)">BOX CAM 5</button>
            </div>

            <div>
                <img id="liveCamera" src="" alt="กำลังเรียกสัญญาณภาพกล้อง...">
            </div>
        </div>

        <script>
            // =================================================================
            // 🔴 ตั้งค่าลิงก์กล้อง: แยกลิงก์ในบ้าน (Local) กับ ลิงก์ดูนอกบ้าน (Cloud P2P ของแบรนด์กล้อง)
            // =================================================================
            const cameraConfig = {
                1: {
                    local: "http://admin:Maple369@192.168.1.17:80/images/snapshot.jpg",
                    cloud: "https://คลาวด์ดูออนไลน์ของกล้องตัวที่1.com/stream" // เอาลิงก์ดูออนไลน์ของตัวกล้องมาใส่ตรงนี้
                },
                2: {
                    local: "http://admin:Maple369@192.168.1.18:80/images/snapshot.jpg",
                    cloud: "https://คลาวด์ดูออนไลน์ของกล้องตัวที่2.com/stream"
                },
                3: { local: "http://admin:Maple369@192.168.1.19:80/images/snapshot.jpg", cloud: "" },
                4: { local: "http://admin:Maple369@192.168.1.20:80/images/snapshot.jpg", cloud: "" },
                5: { local: "http://admin:Maple369@192.168.1.21:80/images/snapshot.jpg", cloud: "" }
            };

            let currentCamId = 1;
            let streamTimer = null;
            let useCloudFallback = false; // ตัวแปรเช็คว่าอยู่นอกบ้านหรือไม่
            
            const imageElement = document.getElementById("liveCamera");
            const statusElement = document.getElementById("camStatus");

            function loadNextFrame() {
                const nextFrame = new Image();
                
                nextFrame.onload = function() {
                    imageElement.src = this.src;
                    // ภาพโหลดสำเร็จ รันเฟรมถัดไปทันที (40ms)
                    streamTimer = setTimeout(loadNextFrame, 40); 
                };
                
                nextFrame.onerror = function() {
                    // 🚨 ถ้าภาพโหลดไม่ขึ้น (เช่น อยู่นอกบ้าน แล้วดึง IP 192.168.1.x ไม่เจอ)
                    if (!useCloudFallback && cameraConfig[currentCamId].cloud !== "") {
                        console.log("🔴 ติดต่อ IP ในบ้านไม่ได้ -> สลับไปใช้ลิงก์คลาวด์ดูนอกบ้านอัตโนมัติ");
                        useCloudFallback = true; // สลับโหมดเป็นนอกบ้าน
                        loadNextFrame();
                    } else {
                        // ถ้าหลุดทั้งคู่ ให้รอ 2 วินาทีแล้วลองใหม่
                        streamTimer = setTimeout(loadNextFrame, 2000);
                    }
                };
                
                // เลือกลิงก์ที่จะดึงภาพตามสถานะเน็ตปัจจุบัน
                let targetUrl = useCloudFallback ? cameraConfig[currentCamId].cloud : cameraConfig[currentCamId].local;
                
                // ใส่ Timestamp กันภาพค้างแคช
                nextFrame.src = targetUrl + "?t=" + new Date().getTime();
            }

            function changeCamera(camId) {
                clearTimeout(streamTimer);
                currentCamId = camId;
                useCloudFallback = false; // รีเซ็ตให้ลองดึงในบ้านดูก่อนทุกครั้งที่สลับกล้อง
                statusElement.innerText = "กำลังแสดงผลวิดีโอสด: BOX CAM " + camId;
                
                const buttons = document.querySelectorAll('.cam-btn');
                buttons.forEach((btn, index) => {
                    if ((index + 1) === camId) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
                
                loadNextFrame();
            }

            window.onload = function() {
                changeCamera(1);
            };
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 เซิร์ฟเวอร์ออนไลน์บนคลาวด์สำเร็จแล้ว`);
});