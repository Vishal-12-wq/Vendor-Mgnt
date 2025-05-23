import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import moment from 'moment';
import Swal from 'sweetalert2';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/order');
        setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

const handleStatusChange = (orderId, newStatus) => {
  Swal.fire({
    title: 'Are you sure?',
    text: `Do you really want to change the order status to "${newStatus}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, change it!',
    cancelButtonText: 'Cancel',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await axios.put('/order/status', {
          orderId,
          status: newStatus,
        });

        if (res.data.status) {
          Swal.fire('Success', res.data.message, 'success');
          fetchOrders(); // Refresh orders after status change
        } else {
          throw new Error(res.data.message || 'Failed to update status');
        }
      } catch (error) {
        console.error('Status change error:', error);
        Swal.fire('Error', error.message || 'Something went wrong', 'error');
      }
    }
  });
};


  return (
    <>
      <section className="section">
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4>Order History</h4>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped text-center" id="datatable">
                      <thead>
                        <tr>
                          <th>S.NO.</th>
                          <th>User Name</th>
                          <th>Total Price</th>
                          <th>Raise Date</th>
                          <th>Products</th>
                          <th>Status</th>
                          <th>Change&nbsp;Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map((order, index) => (
                            <tr key={order._id}>
                              <td>{index + 1}</td>
                              <td>{order.user_id?.name || 'N/A'}</td>
                              <td>{order.total_price.toFixed(2)}</td>
                              <td>{moment(order.created_at).format('DD-MM-YYYY hh:mm A')}</td>
                              
                              <td>
                                <ul className="list-unstyled">
                                  {order.items.map((item, idx) => (
                                    <li key={idx}>
                                      {item.product_id?.name || item.product_name || 'N/A'} (x{item.quantity})  ({item.order_type})
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td>
                                <span className={`badge ${
                                  order.status === 'Completed'
                                    ? 'badge-success'
                                    : order.status === 'Cancelled'
                                    ? 'badge-danger'
                                    : 'badge-warning'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6">No orders found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderHistory;
