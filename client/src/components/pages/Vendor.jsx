import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import axios from '../../api/axiosConfig';
import $ from 'jquery';

const Vendor = () => {
  // State management
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [previewFssaiCertificate, setPreviewFssaiCertificate] = useState(null);
  const [previewOrganicCertificate, setPreviewOrganicCertificate] = useState(null);
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Owner Details
    adminvalue:'admin',
    owner_full_name: '',
    owner_phone: '',
    owner_email: '',
    
    // Company Details
    company_name: '',
    company_pan: '',
    business_type: '',
    company_type: '',
    business_address: '',
    business_email: '',
    about_company: '',
    logo: null,
    organic_certificate: null,
    organic_certificate_validity: '',
    signature: null,
    pickup_location: '',
    fssai_type: '',
    fssai_certificate: null,
    fssai_number: '',
    fssai_validity: '',
    
    // Bank Details
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_address: '',
    
    // GST Details
    gstin: '',
    gst_address: '',
    gst_state: '',
    
    // Status
    status: '0',
    
    // Edit fields
    data_id: '',
    edit_owner_full_name: '',
    edit_owner_phone: '',
    edit_owner_email: '',
    edit_company_name: '',
    edit_company_pan: '',
    edit_business_type: '',
    edit_company_type: '',
    edit_business_address: '',
    edit_business_email: '',
    edit_about_company: '',
    edit_logo: null,
    edit_organic_certificate: null,
    edit_organic_certificate_validity: '',
    edit_signature: null,
    edit_pickup_location: '',
    edit_fssai_type: '',
    edit_fssai_certificate: null,
    edit_fssai_number: '',
    edit_fssai_validity: '',
    edit_bank_name: '',
    edit_account_number: '',
    edit_ifsc_code: '',
    edit_branch_address: '',
    edit_gstin: '',
    edit_gst_address: '',
    edit_gst_state: '',
    edit_status: '0'
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Data fetching
  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/vendors');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      Swal.fire('Error', 'Failed to load vendors', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fieldName = e.target.name;
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // For preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (fieldName === 'logo' || fieldName === 'edit_logo') {
          setPreviewLogo(event.target.result);
        } else if (fieldName === 'signature' || fieldName === 'edit_signature') {
          setPreviewSignature(event.target.result);
        } else if (fieldName === 'fssai_certificate' || fieldName === 'edit_fssai_certificate') {
          setPreviewFssaiCertificate(event.target.result);
        } else if (fieldName === 'organic_certificate' || fieldName === 'edit_organic_certificate') {
          setPreviewOrganicCertificate(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Vendor operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all vendor fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (typeof value === 'object') {
            // Skip objects
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      const res = await axios.post('/vendors', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        Swal.fire('Success', 'Vendor added successfully', 'success');
        resetForm();
        fetchVendors();
        window.$('.bd-example-modal-lg').modal('hide');
      } else {
        throw new Error(res.data.message || 'Failed to add vendor');
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error', error.message || 'Something went wrong', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append edit fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith('edit_') && value !== null && value !== '') {
          const fieldName = key.replace('edit_', '');
          if (value instanceof File) {
            formDataToSend.append(fieldName, value);
          } else if (typeof value === 'object') {
            // Skip objects
          } else {
            formDataToSend.append(fieldName, value);
          }
        }
      });

      formDataToSend.append('_id', formData.data_id);

      const res = await axios.put(`/vendors/${formData.data_id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        Swal.fire('Success', 'Vendor updated successfully', 'success');
        resetEditForm();
        fetchVendors();
        window.$('.editmodal').modal('hide');
      } else {
        throw new Error(res.data.message || 'Failed to update vendor');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error', error.message || 'Something went wrong', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      owner_full_name: '',
      owner_phone: '',
      owner_email: '',
      company_name: '',
      company_pan: '',
      business_type: '',
      company_type: '',
      business_address: '',
      business_email: '',
      about_company: '',
      logo: null,
      organic_certificate: null,
      organic_certificate_validity: '',
      signature: null,
      pickup_location: '',
      fssai_type: '',
      fssai_certificate: null,
      fssai_number: '',
      fssai_validity: '',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      branch_address: '',
      gstin: '',
      gst_address: '',
      gst_state: '',
      status: '0'
    }));
    setPreviewLogo(null);
    setPreviewSignature(null);
    setPreviewFssaiCertificate(null);
    setPreviewOrganicCertificate(null);
    setErrors({});
  };

  const resetEditForm = () => {
    setFormData(prev => ({
      ...prev,
      data_id: '',
      edit_owner_full_name: '',
      edit_owner_phone: '',
      edit_owner_email: '',
      edit_company_name: '',
      edit_company_pan: '',
      edit_business_type: '',
      edit_company_type: '',
      edit_business_address: '',
      edit_business_email: '',
      edit_about_company: '',
      edit_logo: null,
      edit_organic_certificate: null,
      edit_organic_certificate_validity: '',
      edit_signature: null,
      edit_pickup_location: '',
      edit_fssai_type: '',
      edit_fssai_certificate: null,
      edit_fssai_number: '',
      edit_fssai_validity: '',
      edit_bank_name: '',
      edit_account_number: '',
      edit_ifsc_code: '',
      edit_branch_address: '',
      edit_gstin: '',
      edit_gst_address: '',
      edit_gst_state: '',
      edit_status: '0'
    }));
    setPreviewLogo(null);
    setPreviewSignature(null);
    setPreviewFssaiCertificate(null);
    setPreviewOrganicCertificate(null);
    setErrors({});
  };

  const handleEdit = (vendor) => {
    setFormData(prev => ({
      ...prev,
      data_id: vendor._id,
      edit_owner_full_name: vendor.owner_full_name,
      edit_owner_phone: vendor.owner_phone,
      edit_owner_email: vendor.owner_email,
      edit_company_name: vendor.company_name,
      edit_company_pan: vendor.company_pan,
      edit_business_type: vendor.business_type,
      edit_company_type: vendor.company_type,
      edit_business_address: vendor.business_address,
      edit_business_email: vendor.business_email,
      edit_about_company: vendor.about_company,
      edit_organic_certificate_validity: vendor.organic_certificate_validity,
      edit_pickup_location: vendor.pickup_location,
      edit_fssai_type: vendor.fssai_type,
      edit_fssai_number: vendor.fssai_number,
      edit_fssai_validity: vendor.fssai_validity,
      edit_bank_name: vendor.bank_name,
      edit_account_number: vendor.account_number,
      edit_ifsc_code: vendor.ifsc_code,
      edit_branch_address: vendor.branch_address,
      edit_gstin: vendor.gstin,
      edit_gst_address: vendor.gst_address,
      edit_gst_state: vendor.gst_state,
      edit_status: vendor.status
    }));

    // Set preview images if they exist
    if (vendor.logo) {
      setPreviewLogo(`${process.env.REACT_APP_API_IMAGE_URL}/vendors/${vendor.logo}`);
    }
    if (vendor.signature) {
      setPreviewSignature(`${process.env.REACT_APP_API_IMAGE_URL}/vendors/${vendor.signature}`);
    }
    if (vendor.fssai_certificate) {
      setPreviewFssaiCertificate(`${process.env.REACT_APP_API_IMAGE_URL}/vendors/${vendor.fssai_certificate}`);
    }
    if (vendor.organic_certificate) {
      setPreviewOrganicCertificate(`${process.env.REACT_APP_API_IMAGE_URL}/vendors/${vendor.organic_certificate}`);
    }

    window.$('.editmodal').modal('show');
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === '1' ? '0' : '1';
    const message = `Are you sure you want to ${newStatus === '1' ? 'activate' : 'deactivate'} this vendor?`;

    Swal.fire({
      title: 'Confirm',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.put(`/vendors/${id}/status`, { newStatus: newStatus });
          if (res.data.success) {
            Swal.fire('Success', 'Status updated successfully', 'success');
            fetchVendors();
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

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this vendor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      dangerMode: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`/vendors/${id}`);
          if (res.data.success) {
            Swal.fire('Deleted!', 'Vendor deleted successfully', 'success');
            fetchVendors();
          } else {
            throw new Error(res.data.message || 'Failed to delete vendor');
          }
        } catch (error) {
          console.error('Delete error:', error);
          Swal.fire('Error', error.message || 'Something went wrong', 'error');
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Error', 'Please select at least one vendor to delete', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${selectedIds.length} selected vendors?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete('/vendors/bulk', { data: { ids: selectedIds } });
        if (res.data.success) {
          Swal.fire('Deleted!', `${selectedIds.length} vendors deleted`, 'success');
          setSelectedIds([]);
          fetchVendors();
        } else {
          throw new Error(res.data.message || 'Failed to delete vendors');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        Swal.fire('Error', error.message || 'Something went wrong', 'error');
      }
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? data.map(item => item._id) : []);
  };

  // Initialize jQuery plugins
  useEffect(() => {
    $(document).on('click', '.thumbnail-image', function() {
      const fullImageUrl = $(this).data('fullimage');
      $('#modalImage').attr('src', fullImageUrl);
      window.$('#imageModal').modal('show');
    });
  }, []);

  return (
    <>
      <section className="section">
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4>Vendor List</h4>
                  <div>
                    <button 
                      type="button" 
                      className="btn btn-outline-success m-2" 
                      data-toggle="modal" 
                      data-target=".bd-example-modal-lg"
                    
                    >
                      <i className="fa fa-user-plus"></i> New Vendor
                    </button>
                   
                  </div>
                </div>

                <div className="card-body">
                  {isLoading && data.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped text-center" id="datatable">
                        <thead>
                          <tr>
                            {/* <th>
                              <div className="custom-checkbox custom-checkbox-table custom-control">
                                <input 
                                  type="checkbox" 
                                  className="custom-control-input" 
                                  id="checkbox-all"
                                  onChange={handleSelectAll}
                                  checked={selectedIds.length === data.length && data.length > 0}
                                />
                                <label htmlFor="checkbox-all" className="custom-control-label"></label>
                              </div>
                            </th> */}
                            <th>S.NO.</th>
                            <th>Logo</th>
                            <th>Vendor Name</th>
                            <th>Company</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="py-4">
                                {isLoading ? 'Loading...' : 'No vendors found'}
                              </td>
                            </tr>
                          ) : (
                            data.map((val, index) => (
                              <tr key={val._id}>
                                {/* <td>
                                  <div className="custom-checkbox custom-control">
                                    <input
                                      type="checkbox"
                                      className="custom-control-input delete-checkbox"
                                      id={`checkbox-${val._id}`}
                                      checked={selectedIds.includes(val._id)}
                                      onChange={() => handleCheckboxChange(val._id)}
                                      disabled={isLoading}
                                    />
                                    <label htmlFor={`checkbox-${val._id}`} className="custom-control-label"></label>
                                  </div>
                                </td> */}
                                <td>{index + 1}</td>
                                <td>
                                  {val.logo && (
                                    <img 
                                      src={`${process.env.REACT_APP_API_IMAGE_URL}/vendors/${val.logo}`} 
                                      className="thumbnail-image"
                                      data-fullimage={`${process.env.REACT_APP_API_IMAGE_URL}/vendors/${val.logo}`}
                                      alt="Vendor Logo" 
                                      height={50} 
                                    />
                                  )}
                                </td>
                                <td>{val.owner_full_name}</td>
                                <td>{val.company_name}</td>
                                <td>{val.owner_email}</td>
                                <td>{val.owner_phone}</td>
                                <td>
                                  {val.status === '1' ? (
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={() => handleStatusChange(val._id, val.status)}
                                      disabled={isLoading}
                                    >
                                      ACTIVE
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleStatusChange(val._id, val.status)}
                                      disabled={isLoading}
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
                                      id={`dropdownMenuButton-${val._id}`}
                                      data-toggle="dropdown"
                                      aria-haspopup="true"
                                      aria-expanded="true"
                                      disabled={isLoading}
                                    >
                                      Actions
                                    </button>
                                    <div className="dropdown-menu" aria-labelledby={`dropdownMenuButton-${val._id}`}>
                                      <button
                                        className="dropdown-item has-icon"
                                        onClick={() => handleEdit(val)}
                                      >
                                        <i className="far fa-edit mt-2"></i> Edit
                                      </button>
                                      <button
                                        className="dropdown-item has-icon"
                                        onClick={() => handleDelete(val._id)}
                                      >
                                        <i className="fa fa-trash mt-2"></i> Delete
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="modal fade" id="imageModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body text-center">
              <img id="modalImage" src="" alt="Full Image" className="img-fluid" style={{ borderRadius: '8px' }}/>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Vendor</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="Form" className="needs-validation" onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                <div className="row">
                  <h6 className="col-12 mb-3">Owner Details</h6>
                  
                  <input 
                  type='hidden'                       
                  value={formData.adminvalue}
                  onChange={handleInputChange} 
                  name="adminvalue"/>

                  <div className="form-group col-md-4">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.owner_full_name ? 'is-invalid' : ''}`}
                      name="owner_full_name"
                      value={formData.owner_full_name}
                      onChange={handleInputChange}
                      
                    />
                    {errors.owner_full_name && <div className="invalid-feedback">{errors.owner_full_name}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Phone *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.owner_phone ? 'is-invalid' : ''}`}
                      name="owner_phone"
                      value={formData.owner_phone}
                      onChange={handleInputChange}
                      
                    />
                    {errors.owner_phone && <div className="invalid-feedback">{errors.owner_phone}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.owner_email ? 'is-invalid' : ''}`}
                      name="owner_email"
                      value={formData.owner_email}
                      onChange={handleInputChange}
                      
                    />
                    {errors.owner_email && <div className="invalid-feedback">{errors.owner_email}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">Company Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      
                    />
                    {errors.company_name && <div className="invalid-feedback">{errors.company_name}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Company PAN *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.company_pan ? 'is-invalid' : ''}`}
                      name="company_pan"
                      value={formData.company_pan}
                      onChange={handleInputChange}
                      
                    />
                    {errors.company_pan && <div className="invalid-feedback">{errors.company_pan}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Business Type *</label>
                    <select
                      className={`form-control ${errors.business_type ? 'is-invalid' : ''}`}
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Business Type</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Service Provider">Service Provider</option>
                    </select>
                    {errors.business_type && <div className="invalid-feedback">{errors.business_type}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Company Type *</label>
                    <select
                      className={`form-control ${errors.company_type ? 'is-invalid' : ''}`}
                      name="company_type"
                      value={formData.company_type}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Company Type</option>
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">LLP</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                    </select>
                    {errors.company_type && <div className="invalid-feedback">{errors.company_type}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Business Address *</label>
                    <textarea
                      className={`form-control ${errors.business_address ? 'is-invalid' : ''}`}
                      name="business_address"
                      value={formData.business_address}
                      onChange={handleInputChange}
                      rows="2"
                      
                    />
                    {errors.business_address && <div className="invalid-feedback">{errors.business_address}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Business Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.business_email ? 'is-invalid' : ''}`}
                      name="business_email"
                      value={formData.business_email}
                      onChange={handleInputChange}
                      
                    />
                    {errors.business_email && <div className="invalid-feedback">{errors.business_email}</div>}
                  </div>
                  
                  <div className="form-group col-md-12">
                    <label>About Company</label>
                    <textarea
                      className={`form-control ${errors.about_company ? 'is-invalid' : ''}`}
                      name="about_company"
                      value={formData.about_company}
                      onChange={handleInputChange}
                      rows="3"
                    />
                    {errors.about_company && <div className="invalid-feedback">{errors.about_company}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Company Logo</label>
                    <input
                      type="file"
                      className={`form-control ${errors.logo ? 'is-invalid' : ''}`}
                      name="logo"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewLogo && (
                        <img
                          src={previewLogo}
                          alt="Logo Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.logo && <div className="invalid-feedback">{errors.logo}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Signature</label>
                    <input
                      type="file"
                      className={`form-control ${errors.signature ? 'is-invalid' : ''}`}
                      name="signature"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewSignature && (
                        <img
                          src={previewSignature}
                          alt="Signature Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.signature && <div className="invalid-feedback">{errors.signature}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Pickup Location</label>
                    <input
                      type="text"
                      className={`form-control ${errors.pickup_location ? 'is-invalid' : ''}`}
                      name="pickup_location"
                      value={formData.pickup_location}
                      onChange={handleInputChange}
                    />
                    {errors.pickup_location && <div className="invalid-feedback">{errors.pickup_location}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">FSSAI Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Type</label>
                    <select
                      className={`form-control ${errors.fssai_type ? 'is-invalid' : ''}`}
                      name="fssai_type"
                      value={formData.fssai_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select FSSAI Type</option>
                      <option value="Basic">Basic</option>
                      <option value="State">State</option>
                      <option value="Central">Central</option>
                    </select>
                    {errors.fssai_type && <div className="invalid-feedback">{errors.fssai_type}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.fssai_number ? 'is-invalid' : ''}`}
                      name="fssai_number"
                      value={formData.fssai_number}
                      onChange={handleInputChange}
                    />
                    {errors.fssai_number && <div className="invalid-feedback">{errors.fssai_number}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Validity</label>
                    <input
                      type="date"
                      className={`form-control ${errors.fssai_validity ? 'is-invalid' : ''}`}
                      name="fssai_validity"
                      value={formData.fssai_validity}
                      onChange={handleInputChange}
                    />
                    {errors.fssai_validity && <div className="invalid-feedback">{errors.fssai_validity}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Certificate</label>
                    <input
                      type="file"
                      className={`form-control ${errors.fssai_certificate ? 'is-invalid' : ''}`}
                      name="fssai_certificate"
                      onChange={handleImageChange}
                      accept="image/*,.pdf"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewFssaiCertificate && (
                        <img
                          src={previewFssaiCertificate}
                          alt="FSSAI Certificate Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.fssai_certificate && <div className="invalid-feedback">{errors.fssai_certificate}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Organic Certificate</label>
                    <input
                      type="file"
                      className={`form-control ${errors.organic_certificate ? 'is-invalid' : ''}`}
                      name="organic_certificate"
                      onChange={handleImageChange}
                      accept="image/*,.pdf"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewOrganicCertificate && (
                        <img
                          src={previewOrganicCertificate}
                          alt="Organic Certificate Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.organic_certificate && <div className="invalid-feedback">{errors.organic_certificate}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Organic Certificate Validity</label>
                    <input
                      type="date"
                      className={`form-control ${errors.organic_certificate_validity ? 'is-invalid' : ''}`}
                      name="organic_certificate_validity"
                      value={formData.organic_certificate_validity}
                      onChange={handleInputChange}
                    />
                    {errors.organic_certificate_validity && <div className="invalid-feedback">{errors.organic_certificate_validity}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">Bank Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.bank_name ? 'is-invalid' : ''}`}
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                    />
                    {errors.bank_name && <div className="invalid-feedback">{errors.bank_name}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Account Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.account_number ? 'is-invalid' : ''}`}
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleInputChange}
                    />
                    {errors.account_number && <div className="invalid-feedback">{errors.account_number}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>IFSC Code</label>
                    <input
                      type="text"
                      className={`form-control ${errors.ifsc_code ? 'is-invalid' : ''}`}
                      name="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={handleInputChange}
                    />
                    {errors.ifsc_code && <div className="invalid-feedback">{errors.ifsc_code}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Branch Address</label>
                    <textarea
                      className={`form-control ${errors.branch_address ? 'is-invalid' : ''}`}
                      name="branch_address"
                      value={formData.branch_address}
                      onChange={handleInputChange}
                      rows="2"
                    />
                    {errors.branch_address && <div className="invalid-feedback">{errors.branch_address}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">GST Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>GSTIN</label>
                    <input
                      type="text"
                      className={`form-control ${errors.gstin ? 'is-invalid' : ''}`}
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleInputChange}
                    />
                    {errors.gstin && <div className="invalid-feedback">{errors.gstin}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>GST Address</label>
                    <textarea
                      className={`form-control ${errors.gst_address ? 'is-invalid' : ''}`}
                      name="gst_address"
                      value={formData.gst_address}
                      onChange={handleInputChange}
                      rows="2"
                    />
                    {errors.gst_address && <div className="invalid-feedback">{errors.gst_address}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>GST State</label>
                    <input
                      type="text"
                      className={`form-control ${errors.gst_state ? 'is-invalid' : ''}`}
                      name="gst_state"
                      value={formData.gst_state}
                      onChange={handleInputChange}
                    />
                    {errors.gst_state && <div className="invalid-feedback">{errors.gst_state}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="0">Inactive</option>
                      <option value="1">Active</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">

                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Submit'}
                  </button>
                  <button type="button" className="btn btn-dark ml-2" data-dismiss="modal" onClick={resetForm}>
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Vendor Modal */}
      <div className="modal fade editmodal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Vendor</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={resetEditForm}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form className="needs-validation" onSubmit={handleUpdate} encType="multipart/form-data" noValidate>
                <div className="row">
                  <h6 className="col-12 mb-3">Owner Details</h6>

                  <div className="form-group col-md-4">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.owner_full_name ? 'is-invalid' : ''}`}
                      name="edit_owner_full_name"
                      value={formData.edit_owner_full_name}
                      onChange={handleInputChange}
                      
                    />
                    {errors.owner_full_name && <div className="invalid-feedback">{errors.owner_full_name}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Phone *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.owner_phone ? 'is-invalid' : ''}`}
                      name="edit_owner_phone"
                      value={formData.edit_owner_phone}
                      onChange={handleInputChange}
                      
                    />
                    {errors.owner_phone && <div className="invalid-feedback">{errors.owner_phone}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.owner_email ? 'is-invalid' : ''}`}
                      name="edit_owner_email"
                      value={formData.edit_owner_email}
                      onChange={handleInputChange}
                      
                    />
                    {errors.owner_email && <div className="invalid-feedback">{errors.owner_email}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">Company Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                      name="edit_company_name"
                      value={formData.edit_company_name}
                      onChange={handleInputChange}
                      
                    />
                    {errors.company_name && <div className="invalid-feedback">{errors.company_name}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Company PAN *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.company_pan ? 'is-invalid' : ''}`}
                      name="edit_company_pan"
                      value={formData.edit_company_pan}
                      onChange={handleInputChange}
                      
                    />
                    {errors.company_pan && <div className="invalid-feedback">{errors.company_pan}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Business Type *</label>
                    <select
                      className={`form-control ${errors.business_type ? 'is-invalid' : ''}`}
                      name="edit_business_type"
                      value={formData.edit_business_type}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Business Type</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Service Provider">Service Provider</option>
                    </select>
                    {errors.business_type && <div className="invalid-feedback">{errors.business_type}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Company Type *</label>
                    <select
                      className={`form-control ${errors.company_type ? 'is-invalid' : ''}`}
                      name="edit_company_type"
                      value={formData.edit_company_type}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Company Type</option>
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">LLP</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                    </select>
                    {errors.company_type && <div className="invalid-feedback">{errors.company_type}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Business Address *</label>
                    <textarea
                      className={`form-control ${errors.business_address ? 'is-invalid' : ''}`}
                      name="edit_business_address"
                      value={formData.edit_business_address}
                      onChange={handleInputChange}
                      rows="2"
                      
                    />
                    {errors.business_address && <div className="invalid-feedback">{errors.business_address}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Business Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.business_email ? 'is-invalid' : ''}`}
                      name="edit_business_email"
                      value={formData.edit_business_email}
                      onChange={handleInputChange}
                      
                    />
                    {errors.business_email && <div className="invalid-feedback">{errors.business_email}</div>}
                  </div>
                  
                  <div className="form-group col-md-12">
                    <label>About Company</label>
                    <textarea
                      className={`form-control ${errors.about_company ? 'is-invalid' : ''}`}
                      name="edit_about_company"
                      value={formData.edit_about_company}
                      onChange={handleInputChange}
                      rows="3"
                    />
                    {errors.about_company && <div className="invalid-feedback">{errors.about_company}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Company Logo</label>
                    <input
                      type="file"
                      className={`form-control ${errors.logo ? 'is-invalid' : ''}`}
                      name="edit_logo"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewLogo && (
                        <img
                          src={previewLogo}
                          alt="Logo Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.logo && <div className="invalid-feedback">{errors.logo}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Signature</label>
                    <input
                      type="file"
                      className={`form-control ${errors.signature ? 'is-invalid' : ''}`}
                      name="edit_signature"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewSignature && (
                        <img
                          src={previewSignature}
                          alt="Signature Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.signature && <div className="invalid-feedback">{errors.signature}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Pickup Location</label>
                    <input
                      type="text"
                      className={`form-control ${errors.pickup_location ? 'is-invalid' : ''}`}
                      name="edit_pickup_location"
                      value={formData.edit_pickup_location}
                      onChange={handleInputChange}
                    />
                    {errors.pickup_location && <div className="invalid-feedback">{errors.pickup_location}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">FSSAI Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Type</label>
                    <select
                      className={`form-control ${errors.fssai_type ? 'is-invalid' : ''}`}
                      name="edit_fssai_type"
                      value={formData.edit_fssai_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select FSSAI Type</option>
                      <option value="Basic">Basic</option>
                      <option value="State">State</option>
                      <option value="Central">Central</option>
                    </select>
                    {errors.fssai_type && <div className="invalid-feedback">{errors.fssai_type}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.fssai_number ? 'is-invalid' : ''}`}
                      name="edit_fssai_number"
                      value={formData.edit_fssai_number}
                      onChange={handleInputChange}
                    />
                    {errors.fssai_number && <div className="invalid-feedback">{errors.fssai_number}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Validity</label>
                    <input
                      type="date"
                      className={`form-control ${errors.fssai_validity ? 'is-invalid' : ''}`}
                      name="edit_fssai_validity"
                      value={formData.edit_fssai_validity}
                      onChange={handleInputChange}
                    />
                    {errors.fssai_validity && <div className="invalid-feedback">{errors.fssai_validity}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>FSSAI Certificate</label>
                    <input
                      type="file"
                      className={`form-control ${errors.fssai_certificate ? 'is-invalid' : ''}`}
                      name="edit_fssai_certificate"
                      onChange={handleImageChange}
                      accept="image/*,.pdf"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewFssaiCertificate && (
                        <img
                          src={previewFssaiCertificate}
                          alt="FSSAI Certificate Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.fssai_certificate && <div className="invalid-feedback">{errors.fssai_certificate}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Organic Certificate</label>
                    <input
                      type="file"
                      className={`form-control ${errors.organic_certificate ? 'is-invalid' : ''}`}
                      name="edit_organic_certificate"
                      onChange={handleImageChange}
                      accept="image/*,.pdf"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewOrganicCertificate && (
                        <img
                          src={previewOrganicCertificate}
                          alt="Organic Certificate Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.organic_certificate && <div className="invalid-feedback">{errors.organic_certificate}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Organic Certificate Validity</label>
                    <input
                      type="date"
                      className={`form-control ${errors.organic_certificate_validity ? 'is-invalid' : ''}`}
                      name="edit_organic_certificate_validity"
                      value={formData.edit_organic_certificate_validity}
                      onChange={handleInputChange}
                    />
                    {errors.organic_certificate_validity && <div className="invalid-feedback">{errors.organic_certificate_validity}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">Bank Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.bank_name ? 'is-invalid' : ''}`}
                      name="edit_bank_name"
                      value={formData.edit_bank_name}
                      onChange={handleInputChange}
                    />
                    {errors.bank_name && <div className="invalid-feedback">{errors.bank_name}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Account Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.account_number ? 'is-invalid' : ''}`}
                      name="edit_account_number"
                      value={formData.edit_account_number}
                      onChange={handleInputChange}
                    />
                    {errors.account_number && <div className="invalid-feedback">{errors.account_number}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>IFSC Code</label>
                    <input
                      type="text"
                      className={`form-control ${errors.ifsc_code ? 'is-invalid' : ''}`}
                      name="edit_ifsc_code"
                      value={formData.edit_ifsc_code}
                      onChange={handleInputChange}
                    />
                    {errors.ifsc_code && <div className="invalid-feedback">{errors.ifsc_code}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Branch Address</label>
                    <textarea
                      className={`form-control ${errors.branch_address ? 'is-invalid' : ''}`}
                      name="edit_branch_address"
                      value={formData.edit_branch_address}
                      onChange={handleInputChange}
                      rows="2"
                    />
                    {errors.branch_address && <div className="invalid-feedback">{errors.branch_address}</div>}
                  </div>

                  <h6 className="col-12 mb-3 mt-4">GST Details</h6>
                  
                  <div className="form-group col-md-4">
                    <label>GSTIN</label>
                    <input
                      type="text"
                      className={`form-control ${errors.gstin ? 'is-invalid' : ''}`}
                      name="edit_gstin"
                      value={formData.edit_gstin}
                      onChange={handleInputChange}
                    />
                    {errors.gstin && <div className="invalid-feedback">{errors.gstin}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>GST Address</label>
                    <textarea
                      className={`form-control ${errors.gst_address ? 'is-invalid' : ''}`}
                      name="edit_gst_address"
                      value={formData.edit_gst_address}
                      onChange={handleInputChange}
                      rows="2"
                    />
                    {errors.gst_address && <div className="invalid-feedback">{errors.gst_address}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>GST State</label>
                    <input
                      type="text"
                      className={`form-control ${errors.gst_state ? 'is-invalid' : ''}`}
                      name="edit_gst_state"
                      value={formData.edit_gst_state}
                      onChange={handleInputChange}
                    />
                    {errors.gst_state && <div className="invalid-feedback">{errors.gst_state}</div>}
                  </div>
                  
                  <div className="form-group col-md-4">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="edit_status"
                      value={formData.edit_status}
                      onChange={handleInputChange}
                    >
                      <option value="0">Inactive</option>
                      <option value="1">Active</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : 'Update'}
                  </button>

                  <button type="button" className="btn btn-dark ml-2" data-dismiss="modal" onClick={resetEditForm}>
                    Close
                  </button>
                  
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Vendor;