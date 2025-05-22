import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from '../../api/axiosConfig';
import $ from 'jquery';

const SubCategory = () => {
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    image_url: null,
    category:'',
    name: '',
    status: '',

    data_id:'',
    edit_image_url: null,
    edit_category:'',
    edit_name: '',
    edit_status: '',
  });

  const [errors, setErrors] = useState({
    image_url: '',
    category:'',
    name: '',
    status: '',

    edit_image_url: '',
    edit_category:'',
    edit_name: '',
    edit_status: '',
  });

  const [data, showData] = useState([]);

  const [categories, showCategories] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  // Fetch categories
  const fetchcategories = async () => {
    try {
      const res = await axios.get('/categories');
      showCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch subcategories
  const fetchData = async () => {
    try {
      const res = await axios.get('/subcategories');
      showData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchcategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData,   image_url: file,
        edit_image_url: file, });

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const data = new FormData();
      data.append('image_url', formData.image_url);
      data.append('category', formData.category);
      data.append('name', formData.name);
      data.append('status', formData.status);

      const res = await axios.post('/subcategories', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (res.data.success) {
        Swal.fire('Success!', 'subCategory added successfully', 'success');
  
        // Reset form
        setFormData({ image_url: null,category:'', name: '', status: '' });
        $('#image_url').next('.imagePreviewContainer').empty();
        $('#Form')[0].reset();
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').text('');
        $('#Form').removeClass('was-validated');

        
        // Hide modal (using jQuery since Bootstrap modal likely being used)
        window.$('.bd-example-modal-lg').modal('hide');
  
        // Refresh category list
        fetchData();
      } else {
        Swal.fire('Error!', res.data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors); // Set backend validation errors
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
          const res = await axios.put(`/subcategories/${id}/status`, { newStatus });
          if (res.data.success) {
            Swal.fire('Success!', res.data.message, 'success');
            fetchData(); // reload table after updating the status
            setSelectedIds([]); // clear selection if needed
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
      setSelectedIds(data.map(cat => cat._id));
    } else {
      setSelectedIds([]);
    }
  };
  
  
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this subCategory.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      dangerMode: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Make sure to use the correct API endpoint
          const res = await axios.delete(`/subcategories/${id}`); 
          if (res.data.success) {
            Swal.fire('Deleted!', res.data.message, 'success');
            fetchData(); // reload table
            setSelectedIds([]); // clear selection
          } else {
            Swal.fire('Error!', res.data.message, 'error');
          }
        } catch (err) {
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      }
    });
  };
  



  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Error', 'Please select at least one item to delete.', 'error');
      return;
    }
  
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete all the selected items.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
    });
  
    if (confirm.isConfirmed) {
      try {
        const res = await axios.delete('/subcategories/bulkCategory', { data: { ids: selectedIds } });
        Swal.fire('Deleted!', res.data.message, 'success');
        fetchData(); // reload table
        setSelectedIds([]); // clear selection
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Something went wrong.', 'error');
      }
    }
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
  
    try {
      const data = new FormData();

      data.append('data_id', formData.data_id);
      data.append('image_url', formData.edit_image_url); // corrected
      data.append('category', formData.edit_category);
      data.append('name', formData.edit_name);
      data.append('status', formData.edit_status);
  
      const res = await axios.put(`/subcategories/${formData.data_id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (res.data.success) {
        Swal.fire('Success!', 'subCategory Updated successfully', 'success');
        $('#edit_image_url').next('.imagePreviewContainer').empty();
        // Reset form state
        setFormData({
          image_url: null,
          edit_image_url: null,
          edit_name: '',
          edit_category: '',
          edit_status: '',
          data_id: '',
        });
        setPreviewImage('');
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
  



  
  $('input[type="file"]').on('change', function(event) 
  {
      let input = event.target;
      let reader = new FileReader();
      let previewContainer = $(this).closest('.col-lg-12').find('.imagePreviewContainer').first();

      reader.onload = function(e) {
          previewContainer.html(`
              <img src="${e.target.result}" alt="Image Preview" style="max-width: 200px; margin-top: 10px; border: 1px solid #ddd; border-radius: 8px;">
          `);
      }

      if (input.files && input.files[0]) {
          reader.readAsDataURL(input.files[0]);
      }
  });

  $('#checkbox-all').on('change', function ()
  {
      let isChecked = $(this).is(':checked');
      $('input[data-checkboxes="mygroup"]').prop('checked', isChecked);
  });


  $(document).on('change', 'input.delete-checkbox', function () 
  {
      let total = $('input.delete-checkbox').length;
      let checked = $('input.delete-checkbox:checked').length;

      $('#checkbox-all').prop('checked', total === checked);
  });



  $(document).on('click', '.thumbnail-image', function () 
  {
      var fullImageUrl = $(this).data('fullimage');
      $('#modalImage').attr('src', fullImageUrl);
      window.$('#imageModal').modal('show');
  });


  const handleEdit = (e) => {
    const el = e.currentTarget;
    const id = el.getAttribute('data-id');
    const name = el.getAttribute('data-name');
    const category = el.getAttribute('data-category');
    const status = el.getAttribute('data-status');
    const image = el.getAttribute('data-image');

    setFormData(prev => ({
      ...prev,
      data_id: id,
      edit_name: name,
      edit_category: category,
      edit_status: status,
      edit_image_url: '' // clear old file input
    }));

    const previewContainer = $('#edit_image_url').next('.imagePreviewContainer');
    if (image && previewContainer.length) {
      previewContainer.html(`
        <img src="${image}" alt="Image Preview" style="max-width: 200px; margin-top: 10px; border: 1px solid #ddd; border-radius: 8px;">
      `).show();
    }

    window.$('.editmodal').modal('show');
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
                  <h4>SubCategory List</h4>
                  <div>
                    <button type="button" className="btn btn-outline-success m-2" data-toggle="modal" data-target=".bd-example-modal-lg">
                      <i className="fa fa-user-plus"></i> New
                    </button>
                    {/* <button type="button" className="btn btn-outline-danger" onClick={handleBulkDelete}>
                      <i className="fa fa-trash"></i> Delete
                    </button> */}
                  </div>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped text-center" id="datatable">
                      <thead>
                        <tr>
                          {/* <th>
                              <div className="custom-checkbox custom-checkbox-table custom-control">
                                  <input type="checkbox" data-checkboxes="mygroup" data-checkbox-role="dad" className="custom-control-input" 
                                  id="checkbox-all"
                                  onChange={handleSelectAll}
                                  checked={selectedIds.length === data.length}
                                  />
                                  <label for="checkbox-all" className="custom-control-label">ID</label>
                              </div>
                          </th> */}
                          <th>S.NO.</th>
                          <th>Image</th>
                          <th>SubCategory&nbsp;Name</th>
                          <th>Category&nbsp;Name</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((val, index) => (
                          <tr key={val._id}>
                            {/* <td>
                              <div className="custom-checkbox custom-control">
                                <input type="checkbox" data-checkboxes="mygroup" value={val._id}
                                 className="custom-control-input delete-checkbox" 
                                 id={`checkbox-${val._id}`}
                                 checked={selectedIds.includes(val._id)}
                                 onChange={() => handleCheckboxChange(val._id)}
                                 />
                                <label for={`checkbox-${val._id}`} className="custom-control-label">&nbsp;</label>
                              </div>
                            </td> */}
                            <td>{index + 1}</td>
                            <td>
                              <img 
                                src={`${val.image_url}`} 
                                className="thumbnail-image"
                                data-fullimage={`${val.image_url}`}
                                alt="Category" 
                                height={50} 
                              />
                            </td>
                            <td>{val.name}</td>
                            <td>
                              {categories.find(cat_val => cat_val._id === val.category)?.name || 'Unknown'}
                            </td>

                            <td>
                            {val.status === '1' ? (
                              <button
                                className="btn btn-outline-success"
                                onClick={() =>
                                  handleChangeStatus(val._id, '0', 'Are you sure you want to Inactivate the data?')
                                }
                              >
                                ACTIVE
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  handleChangeStatus(val._id, '1', 'Are you sure you want to Activate the data?')
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
                                  }} >
                                      <a className="dropdown-item has-icon editBtn"
                                      
                                      
                                      onClick={handleEdit}
                                      data-id={val._id}
                                      data-category={val.category}
                                      data-name={val.name}
                                      data-status={val.status}
                                      data-image={`${val.image_url}`}
                                    

                                      ><i className="far fa-edit"></i> Edit</a>
                                      <a className="dropdown-item has-icon"  onClick={() => handleDelete(val._id)} ><i className="fa fa-trash"></i> Delete</a>
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


      <div className="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                  <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  

                  <div className="modal-body text-center">
                      <img id="modalImage" src="" alt="Full Image" className="img-fluid" style={{ borderRadius: '8px',}}/>
                  </div>
              </div>
          </div>
      </div>



      {/* Modal Form */}
      <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="myLargeModalLabel">Add SubCategory</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="Form" className="needs-validation" onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                <div className="row">
                  <div className="form-group col-lg-12">
                    <label>Image</label>
                    <input
                      type="file"
                      className={`form-control ${errors.image_url ? 'is-invalid' : ''}`}
                      name="image_url"
                      id='image_url'
                      onChange={handleImageChange}
                      
                    />
                    {previewImage && (
                      <div className="imagePreviewContainer mt-2">
                        <img
                          src={previewImage}
                          alt="Image Preview"
                          style={{
                            maxWidth: '200px',
                            marginTop: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                          }}
                        />
                      </div>
                    )}
                    {errors.image_url && <div className="invalid-feedback">{errors.image_url}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Category</label>
                    
                    <select
                     className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                     name="category"
                     value={formData.category}
                     onChange={handleInputChange}
                    >
                      <option value={''}>Select Category</option>
                      {categories.map((val, index) => (
                        <option value={val._id}>{val.name}</option>
                      ))}

                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      placeholder="Enter Category"
                      value={formData.name}
                      onChange={handleInputChange}
                      
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Status</label>
                    <select
                      className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      
                    >
                      <option value="">Select Status</option>
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











      <div class="modal fade bd-example-modal-lg editmodal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="myLargeModalLabel">Edit SubCategory</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <form id="update_Form" onSubmit={handleUpdate} enctype="multipart/form-data" class="needs-validation" novalidate="" >

                      <input type="hidden" name="data_id" id="data_id" value={formData.data_id}
                                  onChange={handleInputChange}/> 
                          <div class="row">
                              


                            <div className="form-group col-lg-12">
                                <label>Image</label>
                                <input
                                  type="file"
                                  className={`form-control ${errors.edit_image_url ? 'is-invalid' : ''}`}
                                  name="edit_image_url"
                                  id='edit_image_url'
                                  onChange={handleImageChange}
                                />
                                <div className="imagePreviewContainer mt-2">
                                  <img
                                    src={previewImage}
                                    alt="Image Preview"
                                    style={{
                                      maxWidth: '200px',
                                      marginTop: '10px',
                                      border: '1px solid #ddd',
                                      borderRadius: '8px',
                                    }}
                                  />
                                </div>
                                {errors.edit_image_url && <div className="invalid-feedback">{errors.edit_image_url}</div>}
                              </div>

                              <div className="form-group col-lg-12">
                                <label>Category</label>
                                
                                <select
                                className={`form-control ${errors.edit_category ? 'is-invalid' : ''}`}
                                name="edit_category"
                                value={formData.edit_category}
                                onChange={handleInputChange}
                                >
                                  <option value={''}>Select Category</option>
                                  {categories.map((val, index) => (
                                    <option value={val._id}>{val.name}</option>
                                  ))}
                                </select>
                                {errors.edit_category && <div className="invalid-feedback">{errors.edit_category}</div>}
                              </div>

                              <div class="form-group col-lg-12">
                                  <label>Name</label>
                                  <input type="text" class="form-control" 
                                  value={formData.edit_name}
                                  onChange={handleInputChange}
                                  name="edit_name" id="edit_name" placeholder="Enter Category Name" />
                                  <div class="invalid-feedback"></div>
                              </div>


                              


                              <div class="form-group col-lg-12">
                                  <label>Status</label>
                                  <select class="form-control" name="edit_status"
                                  value={formData.edit_status}
                                  onChange={handleInputChange}
                                  id="edit_status" required>
                                      <option value="">Select Status</option>
                                      <option value="1">Active</option>
                                      <option value="0">Inactive</option>
                                  </select>
                                  <div class="invalid-feedback"></div>
                              </div>

                              
                          </div>
                          <div class="form-group">
                              <button type="submit" class="btn btn-outline-primary">Submit</button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      </div>



    </>
  );
};

export default SubCategory;
