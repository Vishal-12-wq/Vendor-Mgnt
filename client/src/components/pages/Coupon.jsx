import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from '../../api/axiosConfig';
import $ from 'jquery';

const Coupon = () => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    expiryDate: '',
    status: '1',
    edit_code: '',
    edit_discountType: 'percentage',
    edit_discountValue: 0,
    edit_minPurchase: 0,
    edit_maxDiscount: 0,
    edit_expiryDate: '',
    edit_status: '1',
    data_id: ''
  });

  const [errors, setErrors] = useState({
    code: '',
    discountType: '',
    discountValue: '',
    minPurchase: '',
    expiryDate: ''
  });

  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch coupons
  const fetchData = async () => {
    try {
      const res = await axios.get('/coupon');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/coupon', formData);

      if (res.data.success) {
        Swal.fire('Success!', 'Coupon added successfully', 'success');
        
        // Reset form
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: 0,
          minPurchase: 0,
          maxDiscount: 0,
          expiryDate: '',
          status: '1'
        });
        $('#Form')[0].reset();
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').text('');
        $('#Form').removeClass('was-validated');
        
        // Hide modal
        window.$('.bd-example-modal-lg').modal('hide');

        // Refresh coupon list
        fetchData();
      } else {
        Swal.fire('Error!', res.data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error!', 'Something went wrong!', 'error');
      }
    }
  };

  const handleChangeStatus = (id, newStatus, message) => {
    Swal.fire({
      title: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.put(`/coupon/${id}/status`, { status: newStatus });
          if (res.data.success) {
            Swal.fire('Success!', res.data.message, 'success');
            fetchData();
            setSelectedIds([]);
          } else {
            Swal.fire('Error!', res.data.message, 'error');
          }
        } catch (err) {
          Swal.fire('Error!', err.response?.data?.message || 'Something went wrong.', 'error');
        }
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(data.map(coupon => coupon._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this coupon.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      dangerMode: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`/coupon/${id}`);
          if (res.data.success) {
            Swal.fire('Deleted!', res.data.message, 'success');
            fetchData();
            setSelectedIds([]);
          } else {
            Swal.fire('Error!', res.data.message, 'error');
          }
        } catch (err) {
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      }
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(`/coupon/${formData.data_id}`, {
        code: formData.edit_code,
        discountType: formData.edit_discountType,
        discountValue: formData.edit_discountValue,
        minPurchase: formData.edit_minPurchase,
        maxDiscount: formData.edit_maxDiscount,
        expiryDate: formData.edit_expiryDate,
        status: formData.edit_status
      });

      if (res.data.success) {
        Swal.fire('Success!', 'Coupon Updated successfully', 'success');
        setFormData({
          ...formData,
          edit_code: '',
          edit_discountType: 'percentage',
          edit_discountValue: 0,
          edit_minPurchase: 0,
          edit_maxDiscount: 0,
          edit_expiryDate: '',
          edit_status: '1',
          data_id: ''
        });
        setErrors({});
        window.$('.editmodal').modal('hide');
        fetchData();
      } else {
        Swal.fire('Error!', res.data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error!', 'Something went wrong!', 'error');
      }
    }
  };

  const handleEdit = (e) => {
    const el = e.currentTarget;
    const id = el.getAttribute('data-id');
    const coupon = data.find(c => c._id === id);
    
    if (coupon) {
      setFormData(prev => ({
        ...prev,
        data_id: id,
        edit_code: coupon.code,
        edit_discountType: coupon.discountType,
        edit_discountValue: coupon.discountValue,
        edit_minPurchase: coupon.minPurchase,
        edit_maxDiscount: coupon.maxDiscount || 0,
        edit_expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
        edit_status: coupon.status
      }));

      window.$('.editmodal').modal('show');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
                  <h4>Coupon List</h4>
                  <div>
                    <button type="button" className="btn btn-outline-success m-2" data-toggle="modal" data-target=".bd-example-modal-lg">
                      <i className="fa fa-plus"></i> New Coupon
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped text-center" id="datatable">
                      <thead>
                        <tr>
                          <th>S.NO.</th>
                          <th>Coupon Code</th>
                          <th>Discount Type</th>
                          <th>Discount Value</th>
                          <th>Min. Purchase</th>
                          <th>Expiry Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((val, index) => (
                          <tr key={val._id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{val.code}</strong>
                            </td>
                            <td>{val.discountType === 'percentage' ? 'Percentage' : 'Flat'}</td>
                            <td>
                              {val.discountType === 'percentage' 
                                ? `${val.discountValue}%` 
                                : `$${val.discountValue.toFixed(2)}`}
                              {val.discountType === 'percentage' && val.maxDiscount && 
                                ` (max $${val.maxDiscount.toFixed(2)})`}
                            </td>
                            <td>${val.minPurchase.toFixed(2)}</td>
                            <td>{formatDate(val.expiryDate)}</td>
                            <td>
                              {val.status  === '1' ? (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() =>
                                    handleChangeStatus(val._id, '0', 'Are you sure you want to deactivate this coupon?')
                                  }
                                >
                                  ACTIVE
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleChangeStatus(val._id, '1', 'Are you sure you want to activate this coupon?')
                                  }
                                >
                                  INACTIVE
                                </button>
                              )}
                            </td>
                            <td>
                              <div className="dropdown d-inline">
                                <button className="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                  Actions
                                </button>
                                <div className="dropdown-menu" x-placement="bottom-start" 
                                  style={{
                                    position: 'absolute',
                                    transform: 'translate3d(0px, 28px, 0px)',
                                    top: '0px',
                                    left: '0px',
                                    willChange: 'transform',
                                  }}>
                                  <a className="dropdown-item has-icon editBtn"
                                    onClick={handleEdit}
                                    data-id={val._id}
                                  >
                                    <i className="far fa-edit"></i> Edit
                                  </a>
                                  <a className="dropdown-item has-icon" onClick={() => handleDelete(val._id)}>
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

      {/* Add Coupon Modal */}
      <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="myLargeModalLabel">Add Coupon</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="Form" className="needs-validation" onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="form-group col-lg-12">
                    <label>Coupon Code</label>
                    <input
                      type="text"
                      className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                      name="code"
                      placeholder="Enter Coupon Code"
                      value={formData.code}
                      onChange={handleInputChange}
                      
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Discount Type</label>
                    <select
                      className={`form-control ${errors.discountType ? 'is-invalid' : ''}`}
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                    {errors.discountType && <div className="invalid-feedback">{errors.discountType}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Discount Value</label>
                    <input
                      type="number"
                      className={`form-control ${errors.discountValue ? 'is-invalid' : ''}`}
                      name="discountValue"
                      placeholder="Enter Discount Value"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      
                      min="0"
                      step={formData.discountType === 'percentage' ? "1" : "0.01"}
                    />
                    {errors.discountValue && <div className="invalid-feedback">{errors.discountValue}</div>}
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div className="form-group col-lg-12">
                      <label>Maximum Discount Amount (optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxDiscount"
                        placeholder="Enter Maximum Discount Amount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  <div className="form-group col-lg-12">
                    <label>Minimum Purchase Amount</label>
                    <input
                      type="number"
                      className={`form-control ${errors.minPurchase ? 'is-invalid' : ''}`}
                      name="minPurchase"
                      placeholder="Enter Minimum Purchase Amount"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      
                      min="0"
                      step="0.01"
                    />
                    {errors.minPurchase && <div className="invalid-feedback">{errors.minPurchase}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value='1'>Active</option>
                      <option value='0'>Inactive</option>
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

      {/* Edit Coupon Modal */}
      <div className="modal fade bd-example-modal-lg editmodal" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="myLargeModalLabel">Edit Coupon</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="update_Form" onSubmit={handleUpdate} className="needs-validation" noValidate>
                <input type="hidden" name="data_id" value={formData.data_id} />

                <div className="row">
                  <div className="form-group col-lg-12">
                    <label>Coupon Code</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_code ? 'is-invalid' : ''}`}
                      name="edit_code"
                      placeholder="Enter Coupon Code"
                      value={formData.edit_code}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_code && <div className="invalid-feedback">{errors.edit_code}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Discount Type</label>
                    <select
                      className={`form-control ${errors.edit_discountType ? 'is-invalid' : ''}`}
                      name="edit_discountType"
                      value={formData.edit_discountType}
                      onChange={handleInputChange}
                      
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                    {errors.edit_discountType && <div className="invalid-feedback">{errors.edit_discountType}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Discount Value</label>
                    <input
                      type="number"
                      className={`form-control ${errors.edit_discountValue ? 'is-invalid' : ''}`}
                      name="edit_discountValue"
                      placeholder="Enter Discount Value"
                      value={formData.edit_discountValue}
                      onChange={handleInputChange}
                      
                      min="0"
                      step={formData.edit_discountType === 'percentage' ? "1" : "0.01"}
                    />
                    {errors.edit_discountValue && <div className="invalid-feedback">{errors.edit_discountValue}</div>}
                  </div>

                  {formData.edit_discountType === 'percentage' && (
                    <div className="form-group col-lg-12">
                      <label>Maximum Discount Amount (optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="edit_maxDiscount"
                        placeholder="Enter Maximum Discount Amount"
                        value={formData.edit_maxDiscount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  <div className="form-group col-lg-12">
                    <label>Minimum Purchase Amount</label>
                    <input
                      type="number"
                      className={`form-control ${errors.edit_minPurchase ? 'is-invalid' : ''}`}
                      name="edit_minPurchase"
                      placeholder="Enter Minimum Purchase Amount"
                      value={formData.edit_minPurchase}
                      onChange={handleInputChange}
                      
                      min="0"
                      step="0.01"
                    />
                    {errors.edit_minPurchase && <div className="invalid-feedback">{errors.edit_minPurchase}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      className={`form-control ${errors.edit_expiryDate ? 'is-invalid' : ''}`}
                      name="edit_expiryDate"
                      value={formData.edit_expiryDate}
                      onChange={handleInputChange}
                      
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.edit_expiryDate && <div className="invalid-feedback">{errors.edit_expiryDate}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="edit_status"
                      value={formData.edit_status}
                      onChange={handleInputChange}
                    >
                      <option value='1'>Active</option>
                      <option value='0'>Inactive</option>
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
    </>
  );
};

export default Coupon;