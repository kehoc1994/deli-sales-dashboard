// Đọc trực tiếp tab Du_lieu_sach của Google Sheet Demo9 và trả về JSON cho dashboard.
// Chỉ lấy các cột cần cho dashboard; mã nhân viên (E) và mã khách hàng (F) không được đọc.
// Cấu hình qua biến môi trường trên Vercel: SHEET_ID (bắt buộc), SHEET_TAB (mặc định Du_lieu_sach).

const COLUMNS = 'A,B,C,D,G,H,I,J,K,L,M,N,O'; // ngày, mã đơn, phòng KD, khu vực, nhóm SP, sản phẩm, SL, đơn giá, CK, doanh thu, giá vốn, trạng thái, cờ lỗi

function toIsoDate(v) {
  // gviz trả ngày dạng "Date(2026,8,26)" với tháng tính từ 0
  const m = /^Date\((\d+),(\d+),(\d+)/.exec(String(v || ''));
  if (!m) return null;
  return `${m[1]}-${String(+m[2] + 1).padStart(2, '0')}-${String(+m[3]).padStart(2, '0')}`;
}

function toNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const sheetId = process.env.SHEET_ID;
  const tab = process.env.SHEET_TAB || 'Du_lieu_sach';
  if (!sheetId) {
    res.status(500).json({ error: 'Chưa cấu hình biến môi trường SHEET_ID trên Vercel.' });
    return;
  }

  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:json&headers=1`
    + `&sheet=${encodeURIComponent(tab)}&tq=${encodeURIComponent('select ' + COLUMNS)}`;

  let text;
  try {
    const r = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    text = await r.text();
    if (!r.ok || !text.includes('setResponse')) throw new Error('HTTP ' + r.status);
  } catch (e) {
    res.status(502).json({ error: 'Không đọc được Google Sheet. Kiểm tra sheet đã chia sẻ "Bất kỳ ai có đường liên kết: Người xem".', detail: String(e.message || e) });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch (e) {
    res.status(502).json({ error: 'Phản hồi từ Google Sheet không đúng định dạng.' });
    return;
  }
  if (payload.status === 'error') {
    res.status(502).json({ error: 'Google Sheet báo lỗi khi truy vấn.', detail: (payload.errors || []).map(x => x.detailed_message || x.message).join('; ') });
    return;
  }

  const rows = [];
  for (const row of payload.table.rows || []) {
    const c = (row.c || []).map(cell => (cell ? cell.v : null));
    const id = c[1] == null ? '' : String(c[1]).trim();
    if (!id) continue;
    const date = toIsoDate(c[0]);
    if (!date) continue;
    rows.push([
      date, id,
      c[2] == null ? '' : String(c[2]).trim(),
      c[3] == null ? '' : String(c[3]).trim(),
      c[4] == null ? '' : String(c[4]).trim(),
      c[5] == null ? '' : String(c[5]).trim(),
      toNumber(c[6]), toNumber(c[7]), toNumber(c[8]), toNumber(c[9]), toNumber(c[10]),
      c[11] == null ? '' : String(c[11]).trim(),
      c[12] == null ? '' : String(c[12]).trim(),
    ]);
  }

  res.status(200).json({ fetchedAt: new Date().toISOString(), source: tab, count: rows.length, rows });
};
