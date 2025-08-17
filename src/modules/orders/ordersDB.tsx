import React, { useEffect, useRef, useState } from "react";
import { Card, Row, Col, Table, Empty } from "antd";
import { DollarCircleOutlined, ShoppingCartOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import BackHeader from "../../components/common/backHeader";
import { useParams } from "react-router-dom";
import { adminDashboardService } from "../../auth/apiService";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  title: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, title }) => {
  return (
    <Card
      style={{
        margin: "0",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      styles={{
        body: {
          padding: "clamp(16px, 4vw, 24px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          minHeight: "120px",
          justifyContent: "center",
        },
      }}
      hoverable
    >
      <div
        style={{
          width: "clamp(50px, 12vw, 60px)",
          height: "clamp(50px, 12vw, 60px)",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "clamp(8px, 2vw, 12px)",
          fontSize: "clamp(20px, 5vw, 24px)",
          color: "#1890ff",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "clamp(18px, 5vw, 24px)",
          fontWeight: "bold",
          marginBottom: "clamp(4px, 1vw, 6px)",
          color: "#262626",
          lineHeight: "1.2",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "clamp(11px, 3vw, 14px)",
          color: "#8c8c8c",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: "500",
          lineHeight: "1.3",
          textAlign: "center",
          wordBreak: "break-word",
        }}
      >
        {title}
      </div>
    </Card>
  );
};

interface ItemWiseCount {
  itemName: string;
  totalQuantity: string;
  menuConfigurationName: string;
  itemId: number;
  menuConfigurationId: number;
}

interface DashboardData {
  totalAmount: number;
  placed: { count: number };
  completed: { count: number };
  cancelled: { count: number };
  totalOrders: number;
  itemWiseCounts: ItemWiseCount[];
}

const OrdersDashboard: React.FC = () => {
  const route = useParams();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const [selectedDate, setSelectedDate] = useState<string>(`${day}-${month}-${year}`);
  const hasFetchedOrders = useRef(false);

  useEffect(() => {
    if (!hasFetchedOrders.current) {
      hasFetchedOrders.current = true;
      fetchOrders();
    }
  }, [selectedDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response;
      const formattedDate = selectedDate; // Use dd-mm-yyyy as is
      if (route?.canteenId) {
        response = await adminDashboardService.getTotalOrders(
          parseInt(route?.canteenId),
          { orderDate: formattedDate }
        );
      } else {
        response = await adminDashboardService.getTotalOrders(
          undefined,
          { orderDate: formattedDate }
        );
      }

      if (response && response?.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Date change handler
  const handleDateChange = (date: string) => {
    // Convert YYYY-MM-DD from input to DD-MM-YYYY
    const [year, month, day] = date.split("-");
    const formattedDate = `${day}-${month}-${year}`;
    hasFetchedOrders.current = false;
    setSelectedDate(formattedDate);
  };

  // Group itemWiseCounts by menuConfigurationName
  const groupedByMenu = dashboardData?.itemWiseCounts?.reduce((acc, item) => {
    const menuName = item.menuConfigurationName;
    if (!acc[menuName]) {
      acc[menuName] = [];
    }
    acc[menuName].push(item);
    return acc;
  }, {} as Record<string, ItemWiseCount[]>);

  // Prepare table data for each menuConfigurationName
  const getTableData = (menuName: string) => {
    return (groupedByMenu?.[menuName] || []).map((item, index) => ({
      key: `${menuName}-${item.itemName}-${index}`,
      itemName: item.itemName,
      totalOrdered: parseInt(item.totalQuantity), // Convert string to number
    }));
  };

  // Table columns
  const columns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      render: (text: string) => <span style={{ fontSize: "16px" }}>{text}</span>,
    },
    {
      title: "Quantity",
      dataIndex: "totalOrdered",
      key: "totalOrdered",
      render: (text: number) => <span style={{ fontSize: "16px" }}>{text}</span>,
    },
  ];

  // Calculate stats from dashboardData
  const statCards = [
    {
      icon: <DollarCircleOutlined />,
      value: `₹ ${dashboardData?.totalAmount || 0}`,
      title: "Total Revenue",
    },
    {
      icon: <ShoppingCartOutlined />,
      value: dashboardData?.totalOrders || 0,
      title: "Total Orders",
    },
    {
      icon: <CheckCircleOutlined />,
      value: dashboardData?.completed?.count || 0,
      title: "Total Delivered",
    },
    {
      icon: <CloseCircleOutlined />,
      value: dashboardData?.cancelled?.count || 0,
      title: "Total Cancelled",
    },
  ];

  return (
    <div
      style={{
        padding: "clamp(12px, 3vw, 20px)",
        paddingTop: "2px",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <BackHeader
        path={
          route?.canteenName && route?.canteenId
            ? `/canteens-list/canteen-dashboard/${route?.canteenId}/${route?.canteenName}`
            : `/dashboard`
        }
        title={
          route?.canteenName
            ? `Orders Dashboard | ${route.canteenName}`
            : "Orders Dashboard"
        }
        styles={{
          marginBottom: "clamp(12px, 3vw, 20px)",
        }}
      />

      {/* Date Filter */}
      <Row style={{ marginBottom: "clamp(12px, 3vw, 20px)" }} justify="end">
        <Col>
          <input
            type="date"
            style={{
              alignSelf: "flex-end",
              borderRadius: "12px",
              background: "#F6F6F6",
              padding: "5px",
              color: "#1977f3",
              width: "130px",
              border: "1px solid #d9d9d9",
              marginTop: 8,
              fontSize: "14px",
            }}
            value={selectedDate.split("-").reverse().join("-")} // Convert DD-MM-YYYY to YYYY-MM-DD for input
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </Col>
      </Row>

      {/* Stats Grid */}
      <Row
        gutter={[
          { xs: 12, sm: 16, md: 20, lg: 24 },
          { xs: 12, sm: 16, md: 20, lg: 24 },
        ]}
        style={{ marginBottom: "clamp(20px, 5vw, 35px)" }}
      >
        {statCards.map((card, index) => (
          <Col key={index} xs={12} sm={12} md={8} lg={6}>
            <StatCard icon={card.icon} value={card.value} title={card.title} />
          </Col>
        ))}
      </Row>

      {/* Orders Table */}
      {!dashboardData || dashboardData.itemWiseCounts.length === 0 ? (
        <Empty description={`No orders available on this date (${selectedDate})`} />
      ) : (
        <div>
          <h3 style={{ marginBottom: "16px" }}>Date: {selectedDate}</h3>
          {Object.keys(groupedByMenu || {}).sort().map((menuName) => (
            <Card key={menuName} style={{ marginBottom: "16px" }}>
              <Table
                columns={columns}
                dataSource={getTableData(menuName)}
                pagination={false}
                size="small"
                rowKey="key"
                loading={loading}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersDashboard;