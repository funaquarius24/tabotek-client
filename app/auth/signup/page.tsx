'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

function SignUpForm() {
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get the callback URL from query parameters, document.referrer, or use home as default
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Clear previous errors
    setError('');

    // Basic validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      addToast('First name is required', 'error');
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      addToast('Last name is required', 'error');
      setLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      addToast('Username is required', 'error');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      addToast('Username must be between 3 and 20 characters', 'error');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      addToast('Username can only contain letters, numbers, and underscores', 'error');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      addToast('Email is required', 'error');
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      addToast('Please enter a valid email address', 'error');
      setLoading(false);
      return;
    }

    if (!formData.country) {
      setError('Please select your country');
      addToast('Please select your country', 'error');
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      setError('Please select your gender');
      addToast('Please select your gender', 'error');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      addToast('Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      addToast('Password must be at least 8 characters long', 'error');
      setLoading(false);
      return;
    }

    try {
      // Check if email and username are available
      const checkResponse = await fetch('/api/auth/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
        }),
      });

      if (!checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.errors) {
          if (checkData.errors.email) {
            setError(checkData.errors.email);
            addToast(checkData.errors.email, 'error');
            setLoading(false);
            return;
          }
          if (checkData.errors.username) {
            setError(checkData.errors.username);
            addToast(checkData.errors.username, 'error');
            setLoading(false);
            return;
          }
        }
        throw new Error('Failed to check availability');
      }

      // Proceed with registration
      const registerResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      setSuccess(true);

      // Redirect to the callback URL after a short delay to show success message
      setTimeout(() => {
        const redirectTo = callbackUrl.startsWith('/') ? callbackUrl : '/';
        router.push(redirectTo);
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during registration. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-4 sm:px-6">
        <div className="max-w-md w-full space-y-8 mx-auto">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Tech Hub</h1>
            </Link>
            <div className="mt-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">Registration Successful!</h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Welcome, {formData.firstName}! Your account has been created. Please check your email for verification instructions.
              </p>
            </div>
          </div>

          <div className="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-xl rounded-2xl text-center">
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="w-full flex justify-center h-[48px] items-center px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Tech Hub</h1>
          </Link>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Join our community of tech enthusiasts
          </p>
        </div>

        <div className="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-xl rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="johndoe123"
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]{3,20}$"
                title="Username must be 3-20 characters long and contain only letters, numbers, and underscores"
              />
              <p className="mt-1 text-xs text-gray-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="CN">China</option>
                  <option value="IN">India</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="DK">Denmark</option>
                  <option value="FI">Finland</option>
                  <option value="RU">Russia</option>
                  <option value="ZA">South Africa</option>
                  <option value="NG">Nigeria</option>
                  <option value="EG">Egypt</option>
                  <option value="TR">Turkey</option>
                  <option value="TH">Thailand</option>
                  <option value="VN">Vietnam</option>
                  <option value="MY">Malaysia</option>
                  <option value="SG">Singapore</option>
                  <option value="ID">Indonesia</option>
                  <option value="PH">Philippines</option>
                  <option value="NZ">New Zealand</option>
                  <option value="AR">Argentina</option>
                  <option value="CL">Chile</option>
                  <option value="CO">Colombia</option>
                  <option value="PE">Peru</option>
                  <option value="VE">Venezuela</option>
                  <option value="UY">Uruguay</option>
                  <option value="PL">Poland</option>
                  <option value="CZ">Czech Republic</option>
                  <option value="HU">Hungary</option>
                  <option value="RO">Romania</option>
                  <option value="GR">Greece</option>
                  <option value="PT">Portugal</option>
                  <option value="CH">Switzerland</option>
                  <option value="AT">Austria</option>
                  <option value="BE">Belgium</option>
                  <option value="IE">Ireland</option>
                  <option value="LU">Luxembourg</option>
                  <option value="MT">Malta</option>
                  <option value="CY">Cyprus</option>
                  <option value="EE">Estonia</option>
                  <option value="LV">Latvia</option>
                  <option value="LT">Lithuania</option>
                  <option value="SI">Slovenia</option>
                  <option value="SK">Slovakia</option>
                  <option value="HR">Croatia</option>
                  <option value="BA">Bosnia and Herzegovina</option>
                  <option value="ME">Montenegro</option>
                  <option value="MK">North Macedonia</option>
                  <option value="AL">Albania</option>
                  <option value="RS">Serbia</option>
                  <option value="BG">Bulgaria</option>
                  <option value="GE">Georgia</option>
                  <option value="AM">Armenia</option>
                  <option value="AZ">Azerbaijan</option>
                  <option value="KZ">Kazakhstan</option>
                  <option value="UZ">Uzbekistan</option>
                  <option value="TM">Turkmenistan</option>
                  <option value="TJ">Tajikistan</option>
                  <option value="KG">Kyrgyzstan</option>
                  <option value="MN">Mongolia</option>
                  <option value="NP">Nepal</option>
                  <option value="BD">Bangladesh</option>
                  <option value="LK">Sri Lanka</option>
                  <option value="MM">Myanmar</option>
                  <option value="KH">Cambodia</option>
                  <option value="LA">Laos</option>
                  <option value="BT">Bhutan</option>
                  <option value="PK">Pakistan</option>
                  <option value="AF">Afghanistan</option>
                  <option value="IR">Iran</option>
                  <option value="IQ">Iraq</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="QA">Qatar</option>
                  <option value="KW">Kuwait</option>
                  <option value="BH">Bahrain</option>
                  <option value="OM">Oman</option>
                  <option value="YE">Yemen</option>
                  <option value="JO">Jordan</option>
                  <option value="LB">Lebanon</option>
                  <option value="SY">Syria</option>
                  <option value="PS">Palestine</option>
                  <option value="IL">Israel</option>
                  <option value="TN">Tunisia</option>
                  <option value="DZ">Algeria</option>
                  <option value="MA">Morocco</option>
                  <option value="LY">Libya</option>
                  <option value="SD">Sudan</option>
                  <option value="SS">South Sudan</option>
                  <option value="ET">Ethiopia</option>
                  <option value="KE">Kenya</option>
                  <option value="TZ">Tanzania</option>
                  <option value="UG">Uganda</option>
                  <option value="RW">Rwanda</option>
                  <option value="BI">Burundi</option>
                  <option value="MZ">Mozambique</option>
                  <option value="ZW">Zimbabwe</option>
                  <option value="ZW">Zimbabwe</option>
                  <option value="ZM">Zambia</option>
                  <option value="MW">Malawi</option>
                  <option value="AO">Angola</option>
                  <option value="NA">Namibia</option>
                  <option value="BW">Botswana</option>
                  <option value="LS">Lesotho</option>
                  <option value="SZ">Eswatini</option>
                  <option value="GQ">Equatorial Guinea</option>
                  <option value="GA">Gabon</option>
                  <option value="CG">Republic of the Congo</option>
                  <option value="CD">Democratic Republic of the Congo</option>
                  <option value="CM">Cameroon</option>
                  <option value="TD">Chad</option>
                  <option value="CF">Central African Republic</option>
                  <option value="GH">Ghana</option>
                  <option value="CI">Ivory Coast</option>
                  <option value="SN">Senegal</option>
                  <option value="GM">Gambia</option>
                  <option value="GN">Guinea</option>
                  <option value="GW">Guinea-Bissau</option>
                  <option value="SL">Sierra Leone</option>
                  <option value="LR">Liberia</option>
                  <option value="ML">Mali</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="NE">Niger</option>
                  <option value="TG">Togo</option>
                  <option value="BJ">Benin</option>
                  <option value="CV">Cape Verde</option>
                  <option value="ST">São Tomé and Príncipe</option>
                  <option value="KM">Comoros</option>
                  <option value="SC">Seychelles</option>
                  <option value="MU">Mauritius</option>
                  <option value="MG">Madagascar</option>
                  <option value="RE">Réunion</option>
                  <option value="YT">Mayotte</option>
                  <option value="ZW">Zimbabwe</option>
                  <option value="BW">Botswana</option>
                  <option value="ZW">Zimbabwe</option>
                  <option value="ZW">Zimbabwe</option>
                  <option value="ZW">Zimbabwe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Gender
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="male"
                      name="gender"
                      type="radio"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      required
                    />
                    <label htmlFor="male" className="ml-2 block text-sm text-gray-900">
                      Male
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="female"
                      name="gender"
                      type="radio"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="female" className="ml-2 block text-sm text-gray-900">
                      Female
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="anonymous"
                      name="gender"
                      type="radio"
                      value="anonymous"
                      checked={formData.gender === 'anonymous'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                      Prefer not to say
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center h-[48px] items-center px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-4 sm:px-6">
        <div className="max-w-md w-full space-y-8 mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Tech Hub</h1>
            <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">Create your account</h2>
          </div>
          <div className="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-xl rounded-2xl">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}