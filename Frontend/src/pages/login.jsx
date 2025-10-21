import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            let endpoint, payload;

            if (isAdminLogin) {
                // Admin login
                endpoint = '/api/auth/admin/login';
                payload = { email, password };
            } else if (isLoginView) {
                // Regular user login
                endpoint = '/api/auth/login';
                payload = { email, password };
            } else {
                // User registration
                endpoint = '/api/auth/register';
                payload = { fullName, email, password };
            }

            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (isLoginView || isAdminLogin) {
                // Login successful - save token and redirect
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isAdmin', isAdminLogin.toString());
                
                const successMsg = isAdminLogin 
                    ? '✅ Admin login successful! Redirecting to dashboard...'
                    : '✅ Login successful! Redirecting...';
                
                setSuccessMessage(successMsg);
                
                // Redirect to appropriate dashboard after a short delay
                setTimeout(() => {
                    navigate(isAdminLogin ? '/admin' : '/');
                }, 1000);
            } else {
                // Registration successful - switch to login view
                setSuccessMessage('✅ Account created successfully! Please login with your credentials.');
                
                // Switch to login view after a short delay
                setTimeout(() => {
                    setIsLoginView(true);
                    setEmail('');
                    setPassword('');
                    setFullName('');
                }, 1500);
            }
            
        } catch (err) {
            setError(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setIsAdminLogin(false); // Reset admin login when toggling views
        setError('');
        setSuccessMessage('');
        setEmail('');
        setPassword('');
        setFullName('');
    };

    const toggleAdminLogin = () => {
        setIsAdminLogin(!isAdminLogin);
        setError('');
        setSuccessMessage('');
        setEmail('');
        setPassword('');
        setFullName('');
    };

    // SVG Icons as React Components for better control and styling
    const UserIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );

    const MailIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </svg>
    );

    const LockIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    );

    const EyeIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const EyeOffIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" x2="22" y1="2" y2="22"></line>
        </svg>
    );

    const AdminIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m14.5 9-5 5"></path>
            <path d="m9.5 9 5 5"></path>
        </svg>
    );

    return (
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex items-center justify-center font-sans">
            <div className="relative w-full max-w-4xl flex flex-col md:flex-row bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden m-4">
                
                {/* Decorative Side Panel */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20 transform -skew-y-6 scale-110"></div>
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold mb-4 tracking-tight">
                            {isAdminLogin 
                                ? 'Admin Portal' 
                                : isLoginView 
                                    ? 'Welcome Back!' 
                                    : 'Create Account'
                            }
                        </h1>
                        <p className="text-indigo-200 leading-relaxed">
                            {isAdminLogin 
                                ? 'Access the admin dashboard to manage products, orders, and users.'
                                : isLoginView 
                                    ? 'Sign in to access your exclusive account, discover new arrivals, and manage your orders with ease.'
                                    : 'Join our community! Create an account to get started with a personalized shopping experience.'
                            }
                        </p>
                    </div>
                    <div className="absolute bottom-4 right-4 text-xs text-indigo-300 opacity-50 z-10">
                        CherishIndia
                    </div>
                </div>

                {/* Form Panel */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                            {isAdminLogin 
                                ? 'Admin Login' 
                                : isLoginView 
                                    ? 'Login' 
                                    : 'Register'
                            }
                        </h2>
                        
                        {/* Admin Login Toggle - Only show in login view */}
                        {isLoginView && !loading && (
                            <button
                                type="button"
                                onClick={toggleAdminLogin}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                                    isAdminLogin
                                        ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
                                        : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <AdminIcon className="w-4 h-4" />
                                {isAdminLogin ? 'User Login' : 'Admin Login'}
                            </button>
                        )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {isAdminLogin 
                            ? 'Enter admin credentials to access dashboard'
                            : 'Enter your credentials to continue.'
                        }
                    </p>
                    
                    {/* Success Message */}
                    {successMessage && (
                        <div className={`p-3 rounded-lg mb-4 ${
                            successMessage.includes('✅') 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                            {successMessage}
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg mb-4 bg-red-100 text-red-700 border border-red-200">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name Input (Register only) */}
                        {!isLoginView && !isAdminLogin && (
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                    <UserIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                />
                                <label htmlFor="fullName" className="absolute left-10 -top-2.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">Full Name</label>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                <MailIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={isAdminLogin ? "admin@cherishindia.com" : "your.email@example.com"}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            />
                            <label htmlFor="email" className="absolute left-10 -top-2.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                                {isAdminLogin ? 'Admin Email' : 'Email Address'}
                            </label>
                        </div>
                        
                        {/* Password Input */}
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                <LockIcon className="w-5 h-5" />
                            </span>
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            />
                            <label htmlFor="password" className="absolute left-10 -top-2.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                                {isAdminLogin ? 'Admin Password' : 'Password'}
                            </label>

                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                aria-label="Toggle password visibility"
                            >
                                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        
                        {/* Remember me and Forgot password - Only for regular login */}
                        {isLoginView && !isAdminLogin && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input type="checkbox" id="remember-me" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-2 block text-gray-700 dark:text-gray-300">Remember me</label>
                                </div>
                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                    Forgot password?
                                </a>
                            </div>
                        )}
                        
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                    isAdminLogin
                                        ? 'from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:ring-red-500'
                                        : 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:ring-indigo-500'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {isAdminLogin 
                                            ? 'Signing In as Admin...' 
                                            : isLoginView 
                                                ? 'Signing In...' 
                                                : 'Creating Account...'
                                        }
                                    </div>
                                ) : (
                                    isAdminLogin 
                                        ? 'Sign In as Admin' 
                                        : isLoginView 
                                            ? 'Sign In' 
                                            : 'Create Account'
                                )}
                            </button>
                        </div>
                    </form>
                    
                    {/* Toggle between login/register - Only show for non-admin */}
                    {!isAdminLogin && (
                        <div className="mt-8 text-center text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                                {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                                <button 
                                    type="button"
                                    onClick={toggleView} 
                                    className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
                                    disabled={loading}
                                >
                                    {isLoginView ? 'Sign up now' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;