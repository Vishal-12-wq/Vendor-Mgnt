import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from '../../api/axiosConfig';
import $ from 'jquery';

const Banner = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    image_url: null,
    title: '',
    sub_title: '',
    status: '',
    data_id: '',
    edit_image_url: null,
    edit_title: '',
    edit_sub_title: '',
    edit_status: '',
  });

  const [errors, setErrors] = useState({
    image_url: '',
    title: '',
    sub_title: '',
    status: '',
  });

  const [data, showData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Fetch banners
  const fetchData = async () => {
    try {
      const res = await axios.get('/banners');
      showData(res.data.data);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image_url: file, edit_image_url: file });
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
      data.append('title', formData.title);
      data.append('sub_title', formData.sub_title);
      data.append('status', formData.status);

      const res = await axios.post('/banners', data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      if (res.data.success) {
        Swal.fire('Success!', 'Banner added successfully', 'success');
        setFormData({ image_url: null, title: '', sub_title: '', status: '' });
        $('#image_url').next('.imagePreviewContainer').empty();
        $('#Form')[0].reset();
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').text('');
        $('#Form').removeClass('was-validated');
        window.$('.bd-example-modal-lg').modal('hide');
        fetchData();
      } else {
        Swal.fire('Error!', res.data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
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
          const res = await axios.put(`/banners/${id}/status`, { newStatus });
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
      setSelectedIds(data.map(banner => banner._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this banner.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      dangerMode: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`/banners/${id}`); 
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
      const data = new FormData();
      data.append('data_id', formData.data_id);
      data.append('image_url', formData.edit_image_url);
      data.append('title', formData.edit_title);
      data.append('sub_title', formData.edit_sub_title);
      data.append('status', formData.edit_status);

      const res = await axios.put(`/banners/${formData.data_id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        Swal.fire('Success!', 'Banner Updated successfully', 'success');
        $('#edit_image_url').next('.imagePreviewContainer').empty();
        setFormData({
          image_url: null,
          edit_image_url: null,
          edit_title: '',
          edit_sub_title: '',
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
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error!', 'Something went wrong!', 'error');
      }
    }
  };

  // Initialize jQuery plugins
  useEffect(() => {
    $('input[type="file"]').on('change', function(event) {
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

    $('#checkbox-all').on('change', function() {
      let isChecked = $(this).is(':checked');
      $('input[data-checkboxes="mygroup"]').prop('checked', isChecked);
    });

    $(document).on('change', 'input.delete-checkbox', function() {
      let total = $('input.delete-checkbox').length;
      let checked = $('input.delete-checkbox:checked').length;
      $('#checkbox-all').prop('checked', total === checked);
    });

    $(document).on('click', '.thumbnail-image', function() {
      var fullImageUrl = $(this).data('fullimage');
      $('#modalImage').attr('src', fullImageUrl);
      window.$('#imageModal').modal('show');
    });
  }, []);

  const handleEdit = (e) => {
    const el = e.currentTarget;
    const id = el.getAttribute('data-id');
    const title = el.getAttribute('data-title');
    const sub_title = el.getAttribute('data-sub_title');
    const status = el.getAttribute('data-status');
    const image = el.getAttribute('data-image');

    setFormData(prev => ({
      ...prev,
      data_id: id,
      edit_title: title,
      edit_sub_title: sub_title,
      edit_status: status,
      edit_image_url: ''
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
                  <h4>Banner List</h4>
                  <div>
                    <button type="button" className="btn btn-outline-success m-2" data-toggle="modal" data-target=".bd-example-modal-lg">
                      <i className="fa fa-plus"></i> New Banner
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped text-center" id="datatable">
                      <thead>
                        <tr>
                          <th>S.NO.</th>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Sub Title</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((val, index) => (
                          <tr key={val._id}>
                            <td>{index + 1}</td>
                            <td>
                              <img 
                                src={`${val.image_url}`} 
                                className="thumbnail-image"
                                data-fullimage={`${val.image_url}`}
                                alt="Banner" 
                                height={50} 
                              />
                            </td>
                            <td>{val.title}</td>
                            <td>{val.sub_title}</td>
                            <td>
                              {val.status === '1' ? (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() =>
                                    handleChangeStatus(val._id, '0', 'Are you sure you want to Inactivate the banner?')
                                  }
                                >
                                  ACTIVE
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleChangeStatus(val._id, '1', 'Are you sure you want to Activate the banner?')
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
                                <div className="dropdown-menu" style={{
                                  position: 'absolute',
                                  transform: 'translate3d(0px, 28px, 0px)',
                                  top: '0px',
                                  left: '0px',
                                  willChange: 'transform',
                                }}>
                                  <a className="dropdown-item has-icon editBtn"
                                    onClick={handleEdit}
                                    data-id={val._id}
                                    data-title={val.title}
                                    data-sub_title={val.sub_title}
                                    data-status={val.status}
                                    data-image={`${val.image_url}`}
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

      {/* Image Preview Modal */}
      <div className="modal fade" id="imageModal" tabIndex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
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

      {/* Add Banner Modal */}
      <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="myLargeModalLabel">Add Banner</h5>
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
                      id="image_url"
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
                    <label>Title</label>
                    <input
                      type="text"
                      className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      name="title"
                      placeholder="Enter Banner Title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Sub Title</label>
                    <input
                      type="text"
                      className={`form-control ${errors.sub_title ? 'is-invalid' : ''}`}
                      name="sub_title"
                      placeholder="Enter Banner Sub Title"
                      value={formData.sub_title}
                      onChange={handleInputChange}
                    />
                    {errors.sub_title && <div className="invalid-feedback">{errors.sub_title}</div>}
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

      {/* Edit Banner Modal */}
      <div className="modal fade bd-example-modal-lg editmodal" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="myLargeModalLabel">Edit Banner</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="update_Form" onSubmit={handleUpdate} encType="multipart/form-data" className="needs-validation" noValidate>
                <input type="hidden" name="data_id" value={formData.data_id} onChange={handleInputChange}/> 
                <div className="row">
                  <div className="form-group col-lg-12">
                    <label>Image</label>
                    <input
                      type="file"
                      className={`form-control ${errors.edit_image_url ? 'is-invalid' : ''}`}
                      name="edit_image_url"
                      id="edit_image_url"
                      onChange={handleImageChange}
                    />
                    <div className="imagePreviewContainer mt-2"></div>
                    {errors.edit_image_url && <div className="invalid-feedback">{errors.edit_image_url}</div>}
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Title</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.edit_title}
                      onChange={handleInputChange}
                      name="edit_title" 
                      id="edit_title" 
                      placeholder="Enter Banner Title" 
                    />
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Sub Title</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.edit_sub_title}
                      onChange={handleInputChange}
                      name="edit_sub_title" 
                      id="edit_sub_title" 
                      placeholder="Enter Banner Sub Title" 
                    />
                  </div>

                  <div className="form-group col-lg-12">
                    <label>Status</label>
                    <select 
                      className="form-control" 
                      name="edit_status"
                      value={formData.edit_status}
                      onChange={handleInputChange}
                      id="edit_status" 
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
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
    </>
  );
};

export default Banner;