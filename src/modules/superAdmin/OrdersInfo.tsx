import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, ArrowLeft, Calendar } from 'lucide-react';
import { adminDashboardService } from '../../auth/apiService';

const OrdersInfo = () => {
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [searchMobile, setSearchMobile] = useState('');
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;

  const fetchOrderById = async (id) => {
    setDetailsLoading(true);
    try {
      const response = await adminDashboardService.getOrderbyid({ id });
      console.log("Order Details:", response);
      if (response.message === "Orders fetched successfully" || response.data) {
        setOrderDetails(response.data);
      } else {
        setOrderDetails(null);
      }
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      setOrderDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchOrders = async (page = 1, mobile = '', date = '') => {
    setLoading(true);
    try {
      const response = await adminDashboardService.getAllOrders({
        page,
        limit: itemsPerPage,
        mobile: mobile || undefined,
        date: date || undefined,
      });
      const data = await response;
      if (data.message === "Orders fetched successfully" && data.data) {
        setOrders(data.data.orders || []);
        setTotalOrders(data.data.total || 0);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, searchMobile, selectedDate);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1, searchMobile, selectedDate);
  }, [searchMobile, selectedDate]);

  useEffect(() => {
    fetchOrders(currentPage, searchMobile, selectedDate);
  }, [currentPage]);

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const handleSearch = (e) => {
    setSearchMobile(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewOrderItems = async (order) => {
    setSelectedOrder(order);
    await fetchOrderById(order.id);
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  if (selectedOrder) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={handleBackToOrders}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#2563eb',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '16px',
                fontSize: '14px',
              }}
              onMouseOver={(e) => (e.target.style.color = '#1d4ed8')}
              onMouseOut={(e) => (e.target.style.color = '#2563eb')}
            >
              <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Back to Orders
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>Order Details</h2>
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ color: '#6b7280', fontSize: '16px' }}>Loading order details...</div>
              </div>
            ) : orderDetails ? (
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                <div>
                  <span style={{ fontWeight: '600' }}>Order No:</span> {orderDetails.orderNo}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Mobile:</span> {selectedOrder.orderUser?.mobile || 'N/A'}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>User Name:</span> {selectedOrder.orderUser?.firstName || 'N/A'} {selectedOrder.orderUser?.lastName || ''}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Order Date:</span> {formatDate(orderDetails.orderDate)}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Created At:</span> {formatDateTime(orderDetails.createdAt)}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Status:</span>
                  <span
                    style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor:
                        orderDetails.status === 'completed' ? '#dcfce7' : orderDetails.status === 'initiated' ? '#fef3c7' : '#fee2e2',
                      color: orderDetails.status === 'completed' ? '#166534' : orderDetails.status === 'initiated' ? '#92400e' : '#dc2626',
                    }}
                  >
                    {orderDetails.status}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Total Amount:</span> ₹{orderDetails.totalAmount}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontWeight: '600' }}>Canteen:</span> {orderDetails.orderCanteen?.canteenName || 'N/A'}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ color: '#6b7280', fontSize: '16px' }}>Failed to load order details</div>
              </div>
            )}
          </div>

          {orderDetails && !detailsLoading && (
            <div style={{ padding: '24px' }}>
              
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 16px 0' }}>Order Items</h3>
              {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Item Name
                        </th>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Quantity
                        </th>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Price
                        </th>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.orderItems.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{item.menuItemItem?.name || 'N/A'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{item.quantity}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₹{item.price}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '16px', color: '#6b7280' }}>No items found for this order</div>
              )}

              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 16px 0' }}>Payment Details</h3>
              {orderDetails.payment && orderDetails.payment.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Payment ID
                        </th>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Amount
                        </th>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Status
                        </th>
                        <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Payment Method
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.payment.map((payment, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{payment.id}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₹{payment.amount}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{payment.status}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{payment.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '16px', color: '#6b7280' }}>No payment details available</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>Orders Information</h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', maxWidth: '300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
              <input
                type="text"
                placeholder="Search by mobile number..."
                value={searchMobile}
                onChange={handleSearch}
                style={{
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ position: 'relative', maxWidth: '200px' }}>
              <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                style={{
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            {(searchMobile || selectedDate) && (
              <button
                onClick={() => {
                  setSearchMobile('');
                  setSelectedDate(defaultDate);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#e5e7eb')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#f3f4f6')}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ color: '#6b7280', fontSize: '16px' }}>Loading orders...</div>
          </div>
        )}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Sl</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mobile</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Order No</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Amount</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Order Date</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Canteen</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: 'transparent' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{order.orderUser?.mobile || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#2563eb', fontWeight: '500' }}>{order.orderNo}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₹{order.totalAmount}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{formatDate(order.orderDate)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{order.orderCanteen?.canteenName || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: order.status === 'completed' ? '#dcfce7' : order.status === 'initiated' ? '#fef3c7' : '#fee2e2',
                          color: order.status === 'completed' ? '#166534' : order.status === 'initiated' ? '#92400e' : '#dc2626',
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewOrderItems(order)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 12px',
                          fontSize: '14px',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#bfdbfe')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#dbeafe')}
                      >
                        <Eye style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ color: '#6b7280', fontSize: '18px' }}>No orders found</div>
            <div style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>{searchMobile || selectedDate ? 'Try adjusting your filters' : 'No orders available'}</div>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    color: '#374151',
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                  Previous
                </button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                          padding: '8px 12px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: currentPage === page ? '#3b82f6' : 'white',
                          color: currentPage === page ? 'white' : '#374151',
                          borderColor: currentPage === page ? '#3b82f6' : '#d1d5db',
                        }}
                        onMouseOver={(e) => {
                          if (currentPage !== page) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (currentPage !== page) {
                            e.target.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    color: '#374151',
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  Next
                  <ChevronRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersInfo;