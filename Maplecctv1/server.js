const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// ตัวแปรเก็บลิงก์รูปภาพล่าสุดที่ส่งมาจากคอมพิวเตอร์ในบ้าน
let latestCameraUrl = "https://via.placeholder.com/640x480.png?text=Waiting+For+Camera+Signal...";

app.use(express.json());

// สร้าง Route สำหรับรับลิงก์รูปภาพใหม่จากคอมบ้าน
app.post('/update-url', (req, res) => {
    if (req.body.url) {
        latestCameraUrl = req.body.url;
        return res.status(200).send({ status: "success" });
    }
    res.status(400).send({ status: "fail" });
});

// หน้าแผงควบคุมมัลติแคมหลักบน Render
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ระบบจัดการสตรีมมิ่งกล้องวงจรปิดผ่านคลาวด์</title>
        <style>
            body { background-color: #111; text-align: center; font-family: sans-serif; color: white; margin: 0; padding: 20px; }
            .container { margin-top: 15px; }
            h2 { font-size: 22px; color: #fff; }
            #camStatus { color: #00ffcc; font-size: 16px; margin-bottom: 20px; font-weight: bold; }
            .btn-group { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-bottom: 25px; }
            .cam-btn {
                background-color: #222; color: #aaa; border: 1px solid #444;
                padding: 12px 22px; font-size: 14px; font-weight: bold;
                cursor: pointer; border-radius: 6px; transition: all 0.2s ease-in-out;
            }
            .cam-btn.active { background-color: #00ffcc; color: #111; border-color: #00ffcc; box-shadow: 0 0 12px rgba(0,255,204,0.4); }
            img { max-width: 95%; height: auto; border: 3px solid #333; border-radius: 6px; background-color: #000; box-shadow: 0 4px 15px rgba(0,0,0,0.6); }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>ระบบจัดการสตรีมมิ่งกล้องวงจรปิดผ่านคลาวด์ Render (100%)</h2>
            <div id="camStatus">กำลังแสดงผลวิดีโอสด: BOX CAM 1</div>

            <div class="btn-group">
                <button class="cam-btn active">BOX CAM 1</button>
                <button class="cam-btn">BOX CAM 2</button>
                <button class="cam-btn">BOX CAM 3</button>
                <button class="cam-btn">BOX CAM 4</button>
                <button class="cam-btn">BOX CAM 5</button>
            </div>

            <div>
                <img id="liveCamera" src="${latestCameraUrl}" alt="กำลังดึงสัญญาณภาพจากคลาวด์...">
            </div>
        </div>

        <script>
            // ฟังก์ชันคอยรีเฟรชหน้าจอเช็คภาพใหม่ทุกๆ 2 วินาที
            setInterval(() => {
                // โหลดหน้าเว็บดึงภาพอัปเดตล่าสุดจากหลังบ้าน Render
                fetch(window.location.origin + '/get-latest-frame')
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById("liveCamera").src = data.url;
                    }).catch(err => console.log(err));
            }, 2000);
        </script>
    </body>
    </html>
    `);
});

// ส่งพิกัดภาพล่าสุดให้หน้าจอผู้ใช้งาน
app.get('/get-latest-frame', (req, res) => {
    res.json({ url: latestCameraUrl });
});

app.listen(PORT, () => {
    console.log(`🚀 คลาวด์ Render ออนไลน์สมบูรณ์ที่พอร์ต ${PORT}`);
});