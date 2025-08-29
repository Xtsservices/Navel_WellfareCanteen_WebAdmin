import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Select, 
  Space, 
  Tag, 
  Divider,
  Row,
  Col,
  Alert,
  Statistic
} from 'antd';
import { 
  DownloadOutlined, 
  PhoneOutlined, 
  UserOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import './AllUsersStyles.css'; // Import the CSS file

const { Title, Text } = Typography;
const { Option } = Select;

const AllUsers = () => {
  const location = useLocation();
  const { allUsers } = location.state || {};

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  if (!allUsers || allUsers.length === 0) {
    return (
      <div className="all-users-container">
        <div className="content-wrapper">
          <Card className="no-data-card">
            <Title level={2} className="no-data-title">
              <UserOutlined /> All Users
            </Title>
            <Alert
              message="No Users Available"
              description="There are currently no users to display."
              type="warning"
              icon={<ExclamationCircleOutlined />}
              showIcon
              className="no-data-alert"
            />
          </Card>
        </div>
      </div>
    );
  }

  // Pagination logic
  const totalUsers = allUsers.length;

  // Export function
  const exportToExcel = () => {
    if (!allUsers || allUsers.length === 0) {
      alert("No users available to export");
      return;
    }

    const data = allUsers.map((user, index) => ({
      "S.No": index + 1,
      "Mobile Number": user.mobile || user.phone || user.phoneNumber || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mobile Numbers");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Mobile_Numbers.xlsx");
  };

  // Table columns configuration
  const columns = [
    {
      title: 'S.No',
      key: 'serialNumber',
      width: 80,
      align: 'center',
      render: (_, __, index) => (
        <Tag color="blue" className="serial-tag">
          {(currentPage - 1) * pageSize + index + 1}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <PhoneOutlined />
          <span>Mobile Number</span>
        </Space>
      ),
      key: 'mobile',
      render: (user) => {
        const mobileNumber = user.mobile || user.phone || user.phoneNumber;
        if (mobileNumber) {
          return (
            <Space className="mobile-available">
              <Tag color="green" className="status-dot">●</Tag>
              <Text strong className="mobile-number">
                {mobileNumber}
              </Text>
            </Space>
          );
        } else {
          return (
            <Space className="mobile-unavailable">
              <Tag color="red" className="status-dot">●</Tag>
              <Text type="secondary" italic className="mobile-na">
                Not available
              </Text>
            </Space>
          );
        }
      },
    },
  ];

  // Table pagination configuration
  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: totalUsers,
    showTotal: (total, range) => 
      `Showing ${range[0]}-${range[1]} of ${total} users`,
    showSizeChanger: true,
    pageSizeOptions: ['20', '50', '100'],
    showQuickJumper: true,
    onChange: (page, size) => {
      setCurrentPage(page);
      setPageSize(size);
    },
    onShowSizeChange: (current, size) => {
      setPageSize(size);
      setCurrentPage(1);
    },
  };

  return (
    <div className="all-users-container">
      <div className="content-wrapper">
        {/* Header Card */}
        <Card className="header-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} className="main-title">
                <UserOutlined /> All Users
              </Title>
              <Statistic
                title="Total Users"
                value={totalUsers}
                valueStyle={{ color: '#3f8600', fontSize: '18px' }}
                className="user-statistic"
              />
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                className="export-button"
              >
                Export to Excel
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table Card */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={allUsers}
            rowKey={(record, index) => record.id || index}
            pagination={paginationConfig}
            bordered
            size="middle"
            className="users-table"
            scroll={{ x: 600 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default AllUsers;