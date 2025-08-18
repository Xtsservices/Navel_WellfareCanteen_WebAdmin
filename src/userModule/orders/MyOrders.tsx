import React, { useEffect, useState, useRef } from "react";
import { Card, List, Typography, Button, message, Modal } from "antd";
import UserHeader from "../userComponents/UserHeader";
import axios from "axios";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;

import { BASE_URL } from "../../constants/api";
import QRCode from "qrcode";
import WorldtekLogo from "../../assets/images/worldtek.png";

interface OrderItem {
  id: number;
  itemId: number;
  quantity: number;
  price: number;
  total: number;
  menuItemItem: {
    id: number;
    name: string;
    description: string;
  };
}

interface Payment {
  id: number;
  amount: number;
  status: string;
  paymentMethod: string;
}

interface Order {
  id: number;
  status: string;
  orderDate: number;
  totalAmount: number;
  qrCode: string;
  qrValue: string;
  orderItems: OrderItem[];
  payment: Payment[];
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancellingOrders, setCancellingOrders] = useState<Set<number>>(
    new Set()
  );
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: number;
    status: string;
  } | null>(null);

  // Store refs for each QR frame, keyed by order ID
  const qrFrameRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const token = localStorage.getItem("Token");

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatDateForQR = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeForQR = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isRecentOrder = (timestamp: number) => {
    const orderDate = new Date(timestamp * 1000);
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    return orderDate > fortyEightHoursAgo;
  };

  const handleCancelClick = (orderId: number, currentStatus: string) => {
    if (currentStatus.toLowerCase() === "cancelled") {
      message.info("This order has already been cancelled.");
      return;
    }

    setSelectedOrder({ id: orderId, status: currentStatus });
    setCancelModalVisible(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;
    const { id: orderId } = selectedOrder;

    try {
      setCancellingOrders((prev) => new Set(prev).add(orderId));

      const response = await axios.post(
        `${BASE_URL}/order/cancelOrder`,
        { orderId },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: token || "",
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        )
      );

      message.success("Order cancelled successfully");
    } catch (error: any) {
      console.error("Failed to cancel order", error);
      let errorMessage = "Failed to cancel order";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    } finally {
      setCancellingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      setCancelModalVisible(false);
      setSelectedOrder(null);
    }
  };

  const handleDownloadQR = async (orderId: number) => {
    try {
      const qrFrameElement = qrFrameRefs.current[orderId];
      if (!qrFrameElement) {
        message.error("QR frame not found");
        return;
      }

      // Use html2canvas to capture the QR frame
      const canvas = await html2canvas(qrFrameElement, {
        backgroundColor: "#FFFFFF",
        scale: 2, // Higher resolution
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `QRCode_Order_${orderId}_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success("QR receipt downloaded successfully!");
        }
      }, "image/png");
    } catch (error) {
      console.error("Error downloading QR:", error);
      message.error("Failed to download QR receipt");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/order/listOrders`, {
          headers: {
            authorization: token || "",
          },
        });

        if (response?.data?.data) {
          const ordersWithQR = await Promise.all(
            response.data.data.map(async (order: any) => {
              const qrCodeData = `https://server.welfarecanteen.in/api/order/${order.id}`;
              const qrCodeDataURL = await QRCode.toDataURL(qrCodeData);

              return {
                ...order,
                qrCode: qrCodeDataURL,
                qrValue: qrCodeData,
              };
            })
          );
          console.log("ordersWithQR", ordersWithQR);
          setOrders(ordersWithQR);
        }
      } catch (error: any) {
        console.error("Failed to fetch orders", error);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      case "pending":
        return "#FF9800";
      case "confirmed":
      case "placed":
        return "#2196F3";
      default:
        return "#FF9800";
    }
  };

  return (
    <div style={{ background: "#F8F9FB", minHeight: "100vh", padding: 0 }}>
      <UserHeader headerText="My Orders" />
      <Title level={3} style={{ marginTop: 16, marginLeft: 16 }}>
        Orders History
      </Title>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2 }}
        dataSource={orders}
        renderItem={(order) => {
          const isCancelled = order.status.toLowerCase() === "cancelled";
          const canShowQR =
            isRecentOrder(order.orderDate) &&
            !isCancelled &&
            order.status.toUpperCase() !== "COMPLETED";

          return (
            <List.Item>
              <Card
                title={`Order ID: #${order.id}`}
                extra={
                  <Text
                    style={{
                      color: getStatusColor(order.status),
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {order.status.toUpperCase()}
                  </Text>
                }
                style={{
                  width: "100%",
                  opacity: isCancelled ? 0.7 : 1,
                  textDecoration: isCancelled ? "line-through" : "none",
                }}
              >
                <div
                  style={{
                    textDecoration: isCancelled ? "line-through" : "none",
                    color: isCancelled ? "#888" : "inherit",
                  }}
                >
                  <Text strong>Date:</Text>{" "}
                  <Text>{formatDate(order.orderDate)}</Text>
                  <br />
                  <Text strong>Total:</Text> ₹{order.totalAmount}
                  <br />
                  <Text strong>Payment:</Text> {order.payment?.[0]?.status} via{" "}
                  {order.payment?.[0]?.paymentMethod ?? "N/A"}
                  <br />
                  <Text strong>Items:</Text>
                  <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                    {order.orderItems.map((item, index) => (
                      <li key={index}>
                        {item.menuItemItem.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {order.status.toUpperCase() === "PLACED" && !isCancelled && (
                  <Button
                    danger
                    block
                    loading={cancellingOrders.has(order.id)}
                    style={{ marginTop: 12 }}
                    onClick={() => handleCancelClick(order.id, order.status)}
                  >
                    Cancel Order
                  </Button>
                )}

                {isCancelled && (
                  <div
                    style={{
                      backgroundColor: "#FFEBEE",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      textAlign: "center",
                      marginTop: "12px",
                      border: "1px solid #FFCDD2",
                    }}
                  >
                    <Text style={{ color: "#F44336", fontWeight: "600" }}>
                      This order has been cancelled
                    </Text>
                  </div>
                )}

                {canShowQR && order.qrCode && (
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    {/* QR Frame */}
                    <div
                      ref={(el) => (qrFrameRefs.current[order.id] = el)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "12px",
                        padding: "20px",
                        border: "2px solid #0014A8",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        display: "inline-block",
                        width: "280px",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {/* Header Section */}
                      <div
                        style={{
                          textAlign: "center",
                          marginBottom: "16px",
                          borderBottom: "1px solid #E0E0E0",
                          paddingBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#0014A8",
                            marginBottom: "4px",
                          }}
                        >
                          {order?.orderCanteen?.canteenName || "Welfare Canteen"}
                        </div>
                      </div>

                      {/* QR Code Section */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            padding: "8px",
                            borderRadius: "8px",
                            border: "1px solid #E0E0E0",
                          }}
                        >
                          <img
                            src={order.qrCode}
                            alt={`QR for order #${order.id}`}
                            style={{
                              width: 120,
                              height: 120,
                              display: "block",
                            }}
                          />
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div
                        style={{
                          borderTop: "1px solid #E0E0E0",
                          paddingTop: "12px",
                          fontSize: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ color: "#666666", fontWeight: "500" }}>
                            Order ID:
                          </span>
                          <span style={{ color: "#333333", fontWeight: "600" }}>
                            #{order.id}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ color: "#666666", fontWeight: "500" }}>
                            Booked For:
                          </span>
                          <span style={{ color: "#333333", fontWeight: "600" }}>
                            {formatDateForQR(order.orderDate)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ color: "#666666", fontWeight: "500" }}>
                            Booked Time:
                          </span>
                          <span style={{ color: "#333333", fontWeight: "600" }}>
                            {formatTimeForQR(order.createdAt)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ color: "#666666", fontWeight: "500" }}>
                            Amount:
                          </span>
                          <span
                            style={{
                              color: "#0014A8",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            ₹{order.totalAmount}
                          </span>
                        </div>
                      </div>

                      {/* Brand Section */}
                      <div
                        style={{
                          textAlign: "center",
                          borderTop: "1px solid #F0F0F0",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "12px",
                        }}
                      >
                        <Typography.Text
                          style={{
                            color: "gray",
                            fontSize: "12px",
                            fontWeight: 400,
                            paddingRight: "8px",
                            marginTop: "8px",
                            fontFamily: "Poppins, sans-serif",
                            fontStyle: "italic",
                          }}
                        >
                          Powered by
                        </Typography.Text>
                        <img
                          src={WorldtekLogo}
                          alt="Worldtek Logo"
                          style={{
                            width: "80px",
                            height: "auto",
                            marginTop: "8px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Download Button */}
                    <div style={{ marginTop: "12px" }}>
                      <Button
                        type="link"
                        onClick={() => handleDownloadQR(order.id)}
                        style={{
                          color: "#0014A8",
                          fontWeight: "bold",
                          padding: 0,
                        }}
                      >
                        Tap to Download QR Receipt
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </List.Item>
          );
        }}
      />

      <Modal
        title="Cancel Order"
        open={cancelModalVisible}
        onOk={confirmCancelOrder}
        confirmLoading={
          selectedOrder ? cancellingOrders.has(selectedOrder.id) : false
        }
        onCancel={() => {
          setCancelModalVisible(false);
          setSelectedOrder(null);
        }}
        okText="Yes, Cancel"
        cancelText="No"
      >
        <p>Are you sure you want to cancel this order?</p>
        <p>
          <strong>Order Status:</strong> {selectedOrder?.status?.toUpperCase()}
        </p>
        <p style={{ color: "red" }}>Note: Cancelled orders cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default MyOrders;
