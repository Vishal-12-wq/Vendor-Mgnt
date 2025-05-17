import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import axios from '../../api/axiosConfig';
import $ from 'jquery';

const Product = () => {
  // State management
  const [previewImage, setPreviewImage] = useState(null);
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState([]);

  // Form data state
  const [formData, setFormData] = useState({
    vendor:'',
    name: '',
    description: '',
    ingredients: '',
    hsn_code: '',
    price:'',
    gst_rate: '',
    meta_tag: '',
    meta_keyword: '',
    meta_title: '',
    quantity: '',
    delivery_details: '',
    perishable_status: '',
    organic_certificate: null,
    certificate_validity: '',
    fssai_details: '',
    product_dimension: '',
    product_weight: '',
    category: '',
    subcategory: '',
    images: [],
    thumbnail: null,
    status: '1',
    data_id: '',
    edit_vendor:'',
    edit_name: '',
    edit_description: '',
    edit_ingredients: '',
    edit_hsn_code: '',
    edit_price:'',
    edit_gst_rate: '',
    edit_meta_tag: '',
    edit_meta_keyword: '',
    edit_meta_title: '',
    edit_quantity: '',
    edit_delivery_details: '',
    edit_perishable_status: '',
    edit_organic_certificate: null,
    edit_certificate_validity: '',
    edit_fssai_details: '',
    edit_product_dimension: '',
    edit_product_weight: '',
    edit_category: '',
    edit_subcategory: '',
    edit_images: [],
    edit_thumbnail: null,
    edit_status: '1'
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Data fetching
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      Swal.fire('Error', 'Failed to load categories', 'error');
    }
  }, []);

  const fetchSubcategories = useCallback(async (categoryId) => {
    if (!categoryId) return;
    try {
      const res = await axios.get(`/subcategories/category/${categoryId}`);
      setSubcategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch subcategories:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/products');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      Swal.fire('Error', 'Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);



    const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/vendors');
      setVendors(res.data.data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      Swal.fire('Error', 'Failed to load vendors', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchVendors();
  }, [fetchProducts, fetchCategories]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'category' || name === 'edit_category') {
      fetchSubcategories(value);
    }
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
      if (fieldName === 'thumbnail' || fieldName === 'edit_thumbnail') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: files
      }));
    }
  };

  // Product operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all product fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (key === 'images' && Array.isArray(value)) {
            value.forEach(file => formDataToSend.append('images', file));
          } else if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (typeof value === 'object') {
            // Skip objects
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      const res = await axios.post('/products', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        Swal.fire('Success', 'Product added successfully', 'success');
        resetForm();
        fetchProducts();
        window.$('.bd-example-modal-lg').modal('hide');
      } else {
        throw new Error(res.data.message || 'Failed to add product');
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
          if (fieldName === 'images' && Array.isArray(value)) {
            value.forEach(file => formDataToSend.append('images', file));
          } else if (value instanceof File) {
            formDataToSend.append(fieldName, value);
          } else if (typeof value === 'object') {
            // Skip objects
          } else {
            formDataToSend.append(fieldName, value);
          }
        }
      });

      formDataToSend.append('_id', formData.data_id);

      const res = await axios.put(`/products/${formData.data_id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        Swal.fire('Success', 'Product updated successfully', 'success');
        resetEditForm();
        fetchProducts();
        window.$('.editmodal').modal('hide');
      } else {
        throw new Error(res.data.message || 'Failed to update product');
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
      vendor:'',
      name: '',
      price:'',
      description: '',
      ingredients: '',
      hsn_code: '',
      gst_rate: '',
      meta_tag: '',
      meta_keyword: '',
      meta_title: '',
      quantity: '',
      delivery_details: '',
      perishable_status: '',
      organic_certificate: null,
      certificate_validity: '',
      fssai_details: '',
      product_dimension: '',
      product_weight: '',
      category: '',
      subcategory: '',
      images: [],
      thumbnail: null,
      status: '1'
    }));
    setPreviewImage(null);
    setErrors({});
  };

  const resetEditForm = () => {
    setFormData(prev => ({
      ...prev,
      data_id: '',
      edit_vendor : '',
      edit_name: '',
      edit_description: '',
      edit_ingredients: '',
      edit_price:'',
      edit_hsn_code: '',
      edit_gst_rate: '',
      edit_meta_tag: '',
      edit_meta_keyword: '',
      edit_meta_title: '',
      edit_quantity: '',
      edit_delivery_details: '',
      edit_perishable_status: '',
      edit_organic_certificate: null,
      edit_certificate_validity: '',
      edit_fssai_details: '',
      edit_product_dimension: '',
      edit_product_weight: '',
      edit_category: '',
      edit_subcategory: '',
      edit_images: [],
      edit_thumbnail: null,
      edit_status: '1'
    }));
    setPreviewImage(null);
    setErrors({});
  };

  const handleEdit = (product) => {
    setFormData(prev => ({
      ...prev,
      data_id: product._id,
      edit_vendor: product.vendor,
      edit_name: product.name,
      edit_description: product.description,
      edit_ingredients: product.ingredients,
      edit_hsn_code: product.hsn_code,
      edit_gst_rate: product.gst_rate,
      edit_price: product.price,
      edit_meta_tag: product.meta_tag,
      edit_meta_keyword: product.meta_keyword,
      edit_meta_title: product.meta_title,
      edit_quantity: product.quantity,
      edit_delivery_details: product.delivery_details,
      edit_perishable_status: product.perishable_status,
      edit_certificate_validity: product.certificate_validity,
      edit_fssai_details: product.fssai_details,
      edit_product_dimension: product.product_dimension,
      edit_product_weight: product.product_weight,
      edit_category: product.category,
      edit_subcategory: product.subcategory,
      edit_status: product.status
    }));

    if (product.thumbnail) {
      setPreviewImage(`${process.env.REACT_APP_API_IMAGE_URL}/products/${product.thumbnail}`);
    }

    fetchSubcategories(product.category);
    window.$('.editmodal').modal('show');
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus;
    const message = `Are you sure you want to ${newStatus === '1' ? 'activate' : 'Inactivate'} this product?`;

    Swal.fire({
      title: 'Confirm',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.put(`/products/${id}/status`, { newStatus: newStatus });
          if (res.data.success) {
            Swal.fire('Success', 'Status updated successfully', 'success');
            fetchProducts();
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
      text: 'You want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      dangerMode: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`/products/${id}`);
          if (res.data.success) {
            Swal.fire('Deleted!', 'Product deleted successfully', 'success');
            fetchProducts();
          } else {
            throw new Error(res.data.message || 'Failed to delete product');
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
      Swal.fire('Error', 'Please select at least one product to delete', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${selectedIds.length} selected products?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete('/products/bulk', { data: { ids: selectedIds } });
        if (res.data.success) {
          Swal.fire('Deleted!', `${selectedIds.length} products deleted`, 'success');
          setSelectedIds([]);
          fetchProducts();
        } else {
          throw new Error(res.data.message || 'Failed to delete products');
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
    // $('input[type="file"]').on('change', function(event) {
    //   const input = event.target;
    //   const reader = new FileReader();
    //   const previewContainer = $(this).closest('.col-lg-4').find('.imagePreviewContainer').first();

    //   reader.onload = function(e) {
    //     previewContainer.html(`
    //       <img src="${e.target.result}" alt="Image Preview" style="max-width: 200px; margin-top: 10px; border: 1px solid #ddd; border-radius: 8px;">
    //     `);
    //   };

    //   if (input.files && input.files[0]) {
    //     reader.readAsDataURL(input.files[0]);
    //   }
    // });

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
                  <h4>Product List</h4>
                  <div>
                    <button 
                      type="button" 
                      className="btn btn-outline-success m-2" 
                      data-toggle="modal" 
                      data-target=".bd-example-modal-lg"
                      
                    >
                      <i className="fa fa-user-plus"></i> New
                    </button>
                    {selectedIds.length > 0 && (
                      <button 
                        type="button" 
                        className="btn btn-outline-danger"
                        onClick={handleBulkDelete}
                        disabled={isLoading}
                      >
                        <i className="fa fa-trash"></i> Delete Selected
                      </button>
                    )}
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
                                <label htmlFor="checkbox-all" className="custom-control-label">ID</label>
                              </div>
                            </th> */}
                            <th>S.NO.</th>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Total Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-4">
                                {isLoading ? 'Loading...' : 'No products found'}
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
                                  <img 
                                    src={`${process.env.REACT_APP_API_IMAGE_URL}/products/${val.thumbnail}`} 
                                    className="thumbnail-image"
                                    data-fullimage={`${process.env.REACT_APP_API_IMAGE_URL}/products/${val.thumbnail}`}
                                    alt="Product" 
                                    height={50} 
                                  />
                                </td>
                                <td>{val.name}</td>
                                <td>{val.quantity}</td>
                                <td>
                                  {val.status === '1' ? (
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={() => handleStatusChange(val._id, '0')}
                                      disabled={isLoading}
                                    >
                                      ACTIVE
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleStatusChange(val._id, '1')}
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
              <h5 className="modal-title">Add Product</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="Form" className="needs-validation" onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                <div className="row">
                  <div className="form-group col-lg-4">
                    <label>Thumbnail Image *</label>
                    <input
                      type="file"
                      className={`form-control ${errors.thumbnail ? 'is-invalid' : ''}`}
                      name="thumbnail"
                      onChange={handleImageChange}
                      accept="image/*"
                      
                    />
                    {errors.thumbnail && <div className="invalid-feedback">{errors.thumbnail}</div>}
                    <div className="imagePreviewContainer mt-2">
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Thumbnail Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>

                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Images (Max 5)</label>
                    <input
                      type="file"
                      className={`form-control ${errors.images ? 'is-invalid' : ''}`}
                      name="images"
                      onChange={handleMultipleImageChange}
                      accept="image/*"
                      multiple
                    />
                    {errors.images && <div className="invalid-feedback">{errors.images}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Organic Certificate *</label>
                    <input
                      type="file"
                      className={`form-control ${errors.organic_certificate ? 'is-invalid' : ''}`}
                      name="organic_certificate"
                      onChange={handleImageChange}
                      accept=".pdf,.doc,.docx"
                      
                    />
                    {errors.organic_certificate && <div className="invalid-feedback">{errors.organic_certificate}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Vendor *</label>
                    <select
                      className={`form-control ${errors.vendor ? 'is-invalid' : ''}`}
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(val => (
                        <option key={val._id} value={val._id}>{val.owner_full_name}</option>
                      ))}
                    </select>
                    {errors.vendor && <div className="invalid-feedback">{errors.vendor}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Category *</label>
                    <select
                      className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Subcategory *</label>
                    <select
                      className={`form-control ${errors.subcategory ? 'is-invalid' : ''}`}
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      
                      disabled={!formData.category}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map(subcategory => (
                        <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
                      ))}
                    </select>
                    {errors.subcategory && <div className="invalid-feedback">{errors.subcategory}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>HSN Code *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.hsn_code ? 'is-invalid' : ''}`}
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleInputChange}
                      
                    />
                    {errors.hsn_code && <div className="invalid-feedback">{errors.hsn_code}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Price *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>GST Rate (%) *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.gst_rate ? 'is-invalid' : ''}`}
                      name="gst_rate"
                      value={formData.gst_rate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      
                    />
                    {errors.gst_rate && <div className="invalid-feedback">{errors.gst_rate}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      
                    />
                    {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Description *</label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      
                    />
                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Ingredients *</label>
                    <textarea
                      className={`form-control ${errors.ingredients ? 'is-invalid' : ''}`}
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      rows="2"
                      
                    />
                    {errors.ingredients && <div className="invalid-feedback">{errors.ingredients}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Dimension *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.product_dimension ? 'is-invalid' : ''}`}
                      name="product_dimension"
                      value={formData.product_dimension}
                      onChange={handleInputChange}
                      
                    />
                    {errors.product_dimension && <div className="invalid-feedback">{errors.product_dimension}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Weight *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.product_weight ? 'is-invalid' : ''}`}
                      name="product_weight"
                      value={formData.product_weight}
                      onChange={handleInputChange}
                      
                    />
                    {errors.product_weight && <div className="invalid-feedback">{errors.product_weight}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Certificate Validity *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.certificate_validity ? 'is-invalid' : ''}`}
                      name="certificate_validity"
                      value={formData.certificate_validity}
                      onChange={handleInputChange}
                      
                    />
                    {errors.certificate_validity && <div className="invalid-feedback">{errors.certificate_validity}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>FSSAI Details *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.fssai_details ? 'is-invalid' : ''}`}
                      name="fssai_details"
                      value={formData.fssai_details}
                      onChange={handleInputChange}
                      
                    />
                    {errors.fssai_details && <div className="invalid-feedback">{errors.fssai_details}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Delivery Details *</label>
                    <select
                      className={`form-control ${errors.delivery_details ? 'is-invalid' : ''}`}
                      name="delivery_details"
                      value={formData.delivery_details}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Delivery Option</option>
                      <option value="Local">Local</option>
                      <option value="Select States">Select States</option>
                      <option value="PAN India">PAN India</option>
                    </select>
                    {errors.delivery_details && <div className="invalid-feedback">{errors.delivery_details}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Perishable Status *</label>
                    <select
                      className={`form-control ${errors.perishable_status ? 'is-invalid' : ''}`}
                      name="perishable_status"
                      value={formData.perishable_status}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Status</option>
                      <option value="Perishable">Perishable</option>
                      <option value="Non Perishable">Non Perishable</option>
                    </select>
                    {errors.perishable_status && <div className="invalid-feedback">{errors.perishable_status}</div>}
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

                  <div className="form-group col-lg-4">
                    <label>Meta Title *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.meta_title ? 'is-invalid' : ''}`}
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      
                    />
                    {errors.meta_title && <div className="invalid-feedback">{errors.meta_title}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Meta Keywords *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.meta_keyword ? 'is-invalid' : ''}`}
                      name="meta_keyword"
                      value={formData.meta_keyword}
                      onChange={handleInputChange}
                      
                    />
                    {errors.meta_keyword && <div className="invalid-feedback">{errors.meta_keyword}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Meta Tag *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.meta_tag ? 'is-invalid' : ''}`}
                      name="meta_tag"
                      value={formData.meta_tag}
                      onChange={handleInputChange}
                      
                    />
                    {errors.meta_tag && <div className="invalid-feedback">{errors.meta_tag}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-outline-primary" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade editmodal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Product</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="update_Form" onSubmit={handleUpdate} encType="multipart/form-data" noValidate>
                <input type="hidden" name="data_id" value={formData.data_id}/>
                <div className="row">
                  <div className="form-group col-lg-4">
                    <label>Thumbnail Image</label>
                    <input
                      type="file"
                      className={`form-control ${errors.edit_thumbnail ? 'is-invalid' : ''}`}
                      name="edit_thumbnail"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    <div className="imagePreviewContainer mt-2">
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Thumbnail Preview"
                          style={{
                            maxWidth: '100px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>
                    {errors.edit_thumbnail && <div className="invalid-feedback">{errors.edit_thumbnail}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Images</label>
                    <input
                      type="file"
                      className={`form-control ${errors.edit_images ? 'is-invalid' : ''}`}
                      name="edit_images"
                      onChange={handleMultipleImageChange}
                      accept="image/*"
                      multiple
                    />
                    {errors.edit_images && <div className="invalid-feedback">{errors.edit_images}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Organic Certificate</label>
                    <input
                      type="file"
                      className={`form-control ${errors.edit_organic_certificate ? 'is-invalid' : ''}`}
                      name="edit_organic_certificate"
                      onChange={handleImageChange}
                      accept=".pdf,.doc,.docx"
                    />
                    {errors.edit_organic_certificate && <div className="invalid-feedback">{errors.edit_organic_certificate}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_name ? 'is-invalid' : ''}`}
                      name="edit_name"
                      value={formData.edit_name}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_name && <div className="invalid-feedback">{errors.edit_name}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Vendor *</label>
                    <select
                      className={`form-control ${errors.edit_vendor ? 'is-invalid' : ''}`}
                      name="edit_vendor"
                      value={formData.edit_vendor}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(val => (
                        <option key={val._id} value={val._id}>{val.owner_full_name}</option>
                      ))}
                    </select>
                    {errors.edit_vendor && <div className="invalid-feedback">{errors.edit_vendor}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Category *</label>
                    <select
                      className={`form-control ${errors.edit_category ? 'is-invalid' : ''}`}
                      name="edit_category"
                      value={formData.edit_category}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.edit_category && <div className="invalid-feedback">{errors.edit_category}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Subcategory *</label>
                    <select
                      className={`form-control ${errors.edit_subcategory ? 'is-invalid' : ''}`}
                      name="edit_subcategory"
                      value={formData.edit_subcategory}
                      onChange={handleInputChange}
                      
                      disabled={!formData.edit_category}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map(subcategory => (
                        <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
                      ))}
                    </select>
                    {errors.edit_subcategory && <div className="invalid-feedback">{errors.edit_subcategory}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>HSN Code *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_hsn_code ? 'is-invalid' : ''}`}
                      name="edit_hsn_code"
                      value={formData.edit_hsn_code}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_hsn_code && <div className="invalid-feedback">{errors.edit_hsn_code}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Price *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.edit_price ? 'is-invalid' : ''}`}
                      name="edit_price"
                      value={formData.edit_price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      
                    />
                    {errors.edit_price && <div className="invalid-feedback">{errors.edit_price}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>GST Rate (%) *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.edit_gst_rate ? 'is-invalid' : ''}`}
                      name="edit_gst_rate"
                      value={formData.edit_gst_rate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      
                    />
                    {errors.edit_gst_rate && <div className="invalid-feedback">{errors.edit_gst_rate}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.edit_quantity ? 'is-invalid' : ''}`}
                      name="edit_quantity"
                      value={formData.edit_quantity}
                      onChange={handleInputChange}
                      min="0"
                      
                    />
                    {errors.edit_quantity && <div className="invalid-feedback">{errors.edit_quantity}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Description *</label>
                    <textarea
                      className={`form-control ${errors.edit_description ? 'is-invalid' : ''}`}
                      name="edit_description"
                      value={formData.edit_description}
                      onChange={handleInputChange}
                      rows="3"
                      
                    />
                    {errors.edit_description && <div className="invalid-feedback">{errors.edit_description}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Ingredients *</label>
                    <textarea
                      className={`form-control ${errors.edit_ingredients ? 'is-invalid' : ''}`}
                      name="edit_ingredients"
                      value={formData.edit_ingredients}
                      onChange={handleInputChange}
                      rows="2"
                      
                    />
                    {errors.edit_ingredients && <div className="invalid-feedback">{errors.edit_ingredients}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Dimension *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_product_dimension ? 'is-invalid' : ''}`}
                      name="edit_product_dimension"
                      value={formData.edit_product_dimension}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_product_dimension && <div className="invalid-feedback">{errors.edit_product_dimension}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Product Weight *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_product_weight ? 'is-invalid' : ''}`}
                      name="edit_product_weight"
                      value={formData.edit_product_weight}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_product_weight && <div className="invalid-feedback">{errors.edit_product_weight}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Certificate Validity *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.edit_certificate_validity ? 'is-invalid' : ''}`}
                      name="edit_certificate_validity"
                      value={formData.edit_certificate_validity}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_certificate_validity && <div className="invalid-feedback">{errors.edit_certificate_validity}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>FSSAI Details *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_fssai_details ? 'is-invalid' : ''}`}
                      name="edit_fssai_details"
                      value={formData.edit_fssai_details}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_fssai_details && <div className="invalid-feedback">{errors.edit_fssai_details}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Delivery Details *</label>
                    <select
                      className={`form-control ${errors.edit_delivery_details ? 'is-invalid' : ''}`}
                      name="edit_delivery_details"
                      value={formData.edit_delivery_details}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Delivery Option</option>
                      <option value="Local">Local</option>
                      <option value="Select States">Select States</option>
                      <option value="PAN India">PAN India</option>
                    </select>
                    {errors.edit_delivery_details && <div className="invalid-feedback">{errors.edit_delivery_details}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Perishable Status *</label>
                    <select
                      className={`form-control ${errors.edit_perishable_status ? 'is-invalid' : ''}`}
                      name="edit_perishable_status"
                      value={formData.edit_perishable_status}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Status</option>
                      <option value="Perishable">Perishable</option>
                      <option value="Non Perishable">Non Perishable</option>
                    </select>
                    {errors.edit_perishable_status && <div className="invalid-feedback">{errors.edit_perishable_status}</div>}
                  </div>

                  <div className="form-group col-lg-6">
                    <label>Status</label>
                    <select
                      className={`form-control ${errors.edit_status ? 'is-invalid' : ''}`}
                      name="edit_status"
                      value={formData.edit_status}
                      onChange={handleInputChange}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                    {errors.edit_status && <div className="invalid-feedback">{errors.edit_status}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Meta Title *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_meta_title ? 'is-invalid' : ''}`}
                      name="edit_meta_title"
                      value={formData.edit_meta_title}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_meta_title && <div className="invalid-feedback">{errors.edit_meta_title}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Meta Keywords *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_meta_keyword ? 'is-invalid' : ''}`}
                      name="edit_meta_keyword"
                      value={formData.edit_meta_keyword}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_meta_keyword && <div className="invalid-feedback">{errors.edit_meta_keyword}</div>}
                  </div>

                  <div className="form-group col-lg-4">
                    <label>Meta Tag *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.edit_meta_tag ? 'is-invalid' : ''}`}
                      name="edit_meta_tag"
                      value={formData.edit_meta_tag}
                      onChange={handleInputChange}
                      
                    />
                    {errors.edit_meta_tag && <div className="invalid-feedback">{errors.edit_meta_tag}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-outline-primary" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update'}
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

export default Product;