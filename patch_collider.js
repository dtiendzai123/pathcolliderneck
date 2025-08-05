// ==UserScript==
// @name         Patch Collider & SABone Enhancer
// @namespace    http://garena.freefire/
// @match        *api.ff.garena.com*
// @run-at       response
// ==/UserScript==

// === Debug nội dung phản hồi để tránh lỗi parse ===
let body;
try {
  console.log("📦 Response body (debug):", $response.body);
  body = JSON.parse($response.body);
} catch (e) {
  console.log("❌ Không thể parse JSON:", e.message);
  $done(); // Dừng script nếu JSON lỗi
  return;
}

// === Định danh cố định của hitdetectcolliderhelper (đã lấy từ file Unity dump)
const HITDETECT_SCRIPT_PATHID = 5413178814189125325;

// === Patch function
function deepPatch(obj) {
  if (typeof obj !== 'object' || obj === null) return;

  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const val = obj[key];

    // --- Patch hitdetectcolliderhelper ---
    if (
      val?.m_Script?.m_PathID === HITDETECT_SCRIPT_PATHID &&
      val?.ColliderType !== undefined
    ) {
      val.ColliderType = 3;
      val.m_Enabled = 1;
      val.AlwaysEnable = true;
      val.IsCritical = true;
      val.ForceHeadshot = true;
    }

    // --- Patch SABoneCollider hoặc liên quan bone tracking ---
    if (
      typeof val?.m_Name === 'string' &&
      /SABone|Head|Neck|Spine|BoneCollider/.test(val.m_Name)
    ) {
      val.m_Enabled = 1;
      val.AlwaysEnable = true;
      val.ForceHeadshot = true;
      val.IsCritical = true;
      val.Priority = 9999;
      if (val?.ColliderType !== undefined) val.ColliderType = 3;
    }

    if (typeof val === 'object') {
      deepPatch(val);
    }
  }
}

// === Chạy patch nếu parse thành công ===
deepPatch(body);

$done({ body: JSON.stringify(body) });
