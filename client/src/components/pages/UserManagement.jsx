import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from '../../api/axiosConfig';
import $ from 'jquery';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    adminvalue:'admin',
    name: '',
    phone: '',
    email: '',
    status: '1',
    data_id: '',
    edit_name: '',
    edit_phone: '',
    edit_email: '',
    edit_status: '1'
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    status: ''
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Failed to fetch users', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form (Create User)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post('/users', formData);
      
      if (res.data.success) {
        Swal.fire('Success!', 'User created successfully', 'success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          status: '1'
        });
        $('#userForm')[0].reset();
        window.$('.bd-example-modal-lg').modal('hide');
        fetchUsers();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error!', 'Something went wrong!', 'error');
      }
    }
  };

  // Update User
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.put(`/users/${formData.data_id}`, {
        name: formData.edit_name,
        email: formData.edit_email,
        status: formData.edit_status
      });
      
      if (res.data.success) {
        Swal.fire('Success!', 'User updated successfully', 'success');
        window.$('.editmodal').modal('hide');
        fetchUsers();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error!', 'Something went wrong!', 'error');
      }
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`/users/${id}`);
          if (res.data.success) {
            Swal.fire('Deleted!', 'User deleted successfully', 'success');
            fetchUsers();
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete user', 'error');
        }
      }
    });
  };

  // Bulk Delete Users
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Error', 'Please select at least one user', 'error');
      return;
    }
    
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${selectedIds.length} users.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete('/users/bulk', { data: { ids: selectedIds } });
          if (res.data.success) {
            Swal.fire('Deleted!', res.data.message, 'success');
            setSelectedIds([]);
            fetchUsers();
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete users', 'error');
        }
      }
    });
  };

  // Change User Status
  const handleChangeStatus = (id, currentStatus) => {
    const newStatus = currentStatus === '1' ? '0' : '1';
    const message = `Are you sure you want to ${newStatus === '1' ? 'activate' : 'deactivate'} this user?`;
    
    Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.put(`/users/${id}/status`, { newStatus });
          if (res.data.success) {
            Swal.fire('Success!', 'User status updated', 'success');
            fetchUsers();
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to update status', 'error');
        }
      }
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map(user => user._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Edit User - populate form
  const handleEdit = (user) => {
    setFormData({
      ...formData,
      data_id: user._id,
      edit_name: user.name,
      edit_phone: user.phone,
      edit_email: user.email,
      edit_status: user.status
    });
    window.$('.editmodal').modal('show');
  };

  // OTP Verification Flow
  const [otpData, setOtpData] = useState({
    phone: '',
    otp: ''
  });

  const [otpStep, setOtpStep] = useState('send'); // 'send' or 'verify'

  const handleSendOtp = async () => {
    try {
      const res = await axios.post('/users/register/send-otp', { phone: otpData.phone });
      if (res.data.success) {
        Swal.fire('Success!', 'OTP sent successfully', 'success');
        setOtpStep('verify');
      }
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Failed to send OTP', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post('/users/register/verify-otp', {
        phone: otpData.phone,
        otp: otpData.otp
      });
      
      if (res.data.success) {
        Swal.fire('Success!', 'OTP verified successfully', 'success');
        // You might want to automatically log the user in or redirect
        // For now, we'll just close the modal and reset
        window.$('#otpModal').modal('hide');
        setOtpStep('send');
        setOtpData({ phone: '', otp: '' });
      }
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Invalid OTP', 'error');
    }
  };

  return (
    <>
      {/* Table Section */}
      <section className="section">
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4>User List</h4>
                  <div>
                    <button 
                      type="button" 
                      className="btn btn-outline-success m-2" 
                      data-toggle="modal" 
                      data-target=".bd-example-modal-lg"
                    >
                      <i className="fa fa-user-plus"></i> Add User
                    </button>
                    
                  </div>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped text-center" id="datatable">
                      <thead>
                        <tr>
                          <th>S.NO.</th>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>{user.name || 'N/A'}</td>
                            <td>{user.phone}</td>
                            <td>{user.email || 'N/A'}</td>
                            <td>
                              {user.status === '1' ? (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleChangeStatus(user._id, user.status)}
                                >
                                  ACTIVE
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleChangeStatus(user._id, user.status)}
                                >
                                  INACTIVE
                                </button>
                              )}
                            </td>
                            <td>
                              <div className="dropdown d-inline">
                                <button 
                                  className="btn btn-outline-primary dropdown-toggle" 
                                  type="button" 
                                  id="dropdownMenuButton2" 
                                  data-toggle="dropdown" 
                                  aria-haspopup="true" 
                                  aria-expanded="true"
                                >
                                  Actions
                                </button>
                                <div className="dropdown-menu" style={{
                                  position: 'absolute',
                                  transform: 'translate3d(0px, 28px, 0px)',
                                  top: '0px',
                                  left: '0px',
                                  willChange: 'transform',
                                }}>
                                  <a 
                                    className="dropdown-item has-icon" 
                                    onClick={() => handleEdit(user)}
                                  >
                                    <i className="far fa-edit"></i> Edit
                                  </a>
                                  <a 
                                    className="dropdown-item has-icon" 
                                    onClick={() => handleDelete(user._id)}
                                  >
                                    <i className="fa fa-trash"></i> Delete
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add User Modal */}
      <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="myLargeModalLabel">Add User</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="userForm" className="needs-validation" onSubmit={handleSubmit} noValidate>
                <input 
                  type='hidden'                       
                  value={formData.adminvalue}
                  onChange={handleInputChange} 
                  name="adminvalue"/>

                <div className="row">
                  <div className="form-group col-lg-6">
                    <label>Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Phone</label>
                    <input
                      type="text"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Status</label>
                    <select
                      className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                    {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-outline-primary">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <div className="modal fade bd-example-modal-lg editmodal" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="myLargeModalLabel">Edit User</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="updateUserForm" onSubmit={handleUpdate} className="needs-validation" noValidate>
                <input type="hidden" name="data_id" value={formData.data_id} />
                
                <div className="row">
                  <div className="form-group col-lg-6">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="edit_name"
                      value={formData.edit_name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="edit_phone"
                      value={formData.edit_phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      disabled
                    />
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="edit_email"
                      value={formData.edit_email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="edit_status"
                      value={formData.edit_status}
                      onChange={handleInputChange}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-outline-primary">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <div className="modal fade" id="otpModal" tabIndex="-1" role="dialog" aria-labelledby="otpModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="otpModalLabel">
                {otpStep === 'send' ? 'Send OTP' : 'Verify OTP'}
              </h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {otpStep === 'send' ? (
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={otpData.phone}
                    onChange={(e) => setOtpData({...otpData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={handleSendOtp}
                  >
                    Send OTP
                  </button>
                </div>
              ) : (
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    value={otpData.otp}
                    onChange={(e) => setOtpData({...otpData, otp: e.target.value})}
                    placeholder="Enter OTP"
                  />
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={handleVerifyOtp}
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;