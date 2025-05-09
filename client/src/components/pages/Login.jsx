import React, { useState } from 'react';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    return (
        <>
        <div className="loader" style={{ display: "none" }}></div>
        <div id="app">
            <section className="section">
                <div className="container mt-5">
                    <div className="row">
                        <div className="col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4">
                            <div className="card card-primary">
                                <div className="card-header d-flex flex-column align-items-center text-center">
                                    <h4 className="mb-0">Sign Into Your Account Here</h4>
                                </div>

                                <div className="card-body">
                                    <form id="Form"  className="needs-validation" noValidate>
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            id="email"
                                            required
                                            autoFocus
                                            />
                                            <div className="invalid-feedback"></div>
                                        </div>

                                        <div className="form-group position-relative">
                                            <label htmlFor="password">Password</label>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="form-control"
                                                name="password"
                                                id="password"
                                                required
                                            />
                                            <span
                                                onClick={togglePassword}
                                                className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} field-icon toggle-password`}
                                                style={{
                                                position: 'absolute',
                                                top: '70%',
                                                right: '15px',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer'
                                                }}
                                            ></span>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-1 mb-4">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="remember"
                                                    id="remember"
                                                />
                                                <label className="form-check-label" htmlFor="remember">
                                                    Remember Me
                                                </label>
                                            </div>
                                            <div>
                                                <a href="/user/forgot-password" className="text-info">
                                                    Forgot Password?
                                                </a>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <a href={'/Dashboard'} type="submit" className="btn btn-primary btn-lg btn-block">
                                            Log In
                                            </a>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="mt-5 text-muted text-center">
                                Don't have an account?{' '}
                                <a href="/user/userregister">Create One</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        </>
    );
};

export default Login;
