const axios = require('axios');
const FormData = require('form-data');

// 🔴 นำรหัส API Key ที่ได้จากเว็บฝากรูปมาวางตรงนี้ครับ
const IMGBB_API_KEY = "วางรหัส_API_KEY_ของคุณตรงนี้"; 

const CAM_URL = "http://192.168.1.17:80/images/snapshot.jpg";
const CAM_USER = "admin";
const CAM_PASS = "Maple369";

async function uploadFrame() {
    try {
        // 1. ดึงภาพ snapshot ล่าสุดจากกล้องในบ้านตรงๆ
        const response = await axios({
            method: 'get',
            url: CAM_URL,
            responseType: 'arraybuffer',
            auth: { username: CAM_USER, password: CAM_PASS },
            timeout: 3000
        });

        // 2. เตรียมข้อมูลส่งขึ้นคลาวด์ฝากรูปฟรี
        const form = new FormData();
        form.append('image', Buffer.from(response.data).toString('base64'));

        // 3. ส่งรูปทะลุกำแพงเราเตอร์ขึ้นอินเทอร์เน็ต
        const uploadRes = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, form, {
            headers: form.getHeaders()
        });

        // 4. ได้ลิงก์ภาพออนไลน์ที่เข้าถึงได้จากทั่วโลก 100%
        const globalImageUrl = uploadRes.data.data.url;
        console.log(`✅ [คลาวด์ออนไลน์]: อัปเดตภาพสำเร็จ -> ${globalImageUrl}`);

        // 5. (ทางเลือก) ส่งลิงก์นี้ไปอัปเดตสถานะที่เรนเดอร์ของคุณเพื่อให้หน้าเว็บเปลี่ยนภาพตาม
        // await axios.post('https://my-cctv-box.onrender.com/update-url', { url: globalImageUrl });

    } catch (error) {
        console.error("❌ ข้อผิดพลาดการส่งภาพ:", error.message);
    }

    // ทำงานซ้ำทุกๆ 3 วินาทีเพื่ออัปเดตภาพให้เป็นปัจจุบัน
    setTimeout(uploadFrame, 3000);
}

// เริ่มต้นระบบส่งภาพ
uploadFrame();