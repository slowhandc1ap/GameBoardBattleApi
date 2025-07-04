import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Success() {
  const location = useLocation();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ดึง query param id
  const query = new URLSearchParams(location.search);
  const orderId = query.get('id');

  useEffect(() => {
    if (orderId) {
      fetch(`http://localhost:3000/payment/order/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Order not found");
          return res.json();
        })
        .then(setOrder)
        .catch((err) => {
          console.error(err);
          setError("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
        });
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Payment Successful!</h1>
        <p className="text-gray-700 mb-2">ขอบคุณที่ทำรายการจ่ายเงินสำเร็จ</p>
        <p className="text-gray-500 mb-6">กำลังตรวจสอบคำสั่งซื้อของคุณ...</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {order && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-left">
            <p className="text-gray-800">
              คุณซื้อสินค้า <span className="font-semibold">{order.name}</span>
            </p>
            <p className="text-gray-800">มูลค่า {order.amount} บาท</p>
            <p className="text-gray-800 mt-1">
              สถานะ:{" "}
              <span
                className={
                  order.status === "completed"
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {order.status}
              </span>
            </p>
          </div>
        )}
      </div>
     
    </div>
  );
}