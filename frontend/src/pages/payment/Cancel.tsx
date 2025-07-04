// Cancel.jsx

import { Link } from 'react-router-dom';

export default function Cancel() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: 'red' }}>❌ Payment Cancelled</h1>
      <p>คุณยกเลิกรายการชำระเงิน</p>
      <p>หากเป็นความผิดพลาด สามารถลองใหม่ได้</p>
      <Link to="/payment">🔁 กลับไปลองจ่ายใหม่</Link>
    </div>
  );
}
