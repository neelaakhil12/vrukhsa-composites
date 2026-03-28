import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const { login, register, verifyOtp } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login({ email: formData.email, password: formData.password });
                navigate('/');
            } else {
                if (showOtpStep) {
                    await verifyOtp({ email: formData.email, otp });
                    navigate('/');
                } else {
                    await register(formData);
                    setShowOtpStep(true);
                }
            }
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center py-10 px-4">
                <div className="bg-white rounded shadow-lg flex max-w-4xl w-full overflow-hidden min-h-[500px]">

                    {/* Left Side - Info */}
                    <div className="hidden md:flex bg-primary w-2/5 p-10 flex-col justify-between text-primary-foreground">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">
                                {isLogin ? 'Login' : (showOtpStep ? 'Verify OTP' : 'Looks like you\'re new here!')}
                            </h2>
                            <p className="text-lg text-primary-foreground/80">
                                {isLogin
                                    ? 'Get access to your Orders, Wishlist and Recommendations'
                                    : (showOtpStep 
                                        ? 'Please enter the 6-digit code sent to your email' 
                                        : 'Sign up with your details to get started')}
                            </p>
                        </div>
                        <img
                            src="/logo.jpeg"
                            alt="Login"
                            className="mt-auto w-32 mx-auto"
                        />
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full md:w-3/5 p-10 flex flex-col justify-between">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                            {isLogin ? (
                                <>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            className="peer w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                                            id="email"
                                            placeholder="Enter Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                        <label
                                            htmlFor="email"
                                            className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-500 peer-focus:text-sm"
                                        >
                                            Enter Email/Mobile number
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            className="peer w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                                            id="password"
                                            placeholder="Enter Password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <label
                                            htmlFor="password"
                                            className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-500 peer-focus:text-sm"
                                        >
                                            Enter Password
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {!showOtpStep ? (
                                        <>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    className="peer w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                                                    id="name"
                                                    placeholder="Enter Name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                                <label
                                                    htmlFor="name"
                                                    className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-500 peer-focus:text-sm"
                                                >
                                                    Enter Name
                                                </label>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    required
                                                    className="peer w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                                                    id="email"
                                                    placeholder="Enter Email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                                <label
                                                    htmlFor="email"
                                                    className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-500 peer-focus:text-sm"
                                                >
                                                    Enter Email
                                                </label>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    required
                                                    className="peer w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                                                    id="password"
                                                    placeholder="Enter Password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                <label
                                                    htmlFor="password"
                                                    className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-500 peer-focus:text-sm"
                                                >
                                                    Enter Password
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded border border-green-100">
                                                Check your registered mail and enter the OTP to create your account
                                            </p>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={6}
                                                    className="peer w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors placeholder-transparent text-center text-2xl tracking-widest"
                                                    id="otp"
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                />
                                                <label
                                                    htmlFor="otp"
                                                    className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-500 peer-focus:text-sm w-full text-center"
                                                >
                                                    Enter 6-digit OTP
                                                </label>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowOtpStep(false)}
                                                className="text-xs text-primary underline text-left"
                                            >
                                                Change Email
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            <p className="text-xs text-gray-500">
                                By continuing, you agree to Vruksha Composites' <span className="text-primary">Terms of Use</span> and <span className="text-primary">Privacy Policy</span>.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-orange-500 text-white font-semibold py-3 rounded-sm shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-70"
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Login' : (showOtpStep ? 'Verify & Create Account' : 'Signup'))}
                            </button>

                            {isLogin && (
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(false)}
                                        className="text-primary font-medium text-sm"
                                    >
                                        New to Vruksha Composites? Create an account
                                    </button>
                                </div>
                            )}
                            {!isLogin && (
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(true);
                                            setShowOtpStep(false);
                                        }}
                                        className="text-primary font-medium text-sm"
                                    >
                                        Existing User? Log in
                                    </button>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
