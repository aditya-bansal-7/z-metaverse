"use client"
import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '../../config';

export default function VerificationCode() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push('/accounts/signin');
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const otp = code.join('');
  
    // Validate OTP length
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      setLoading(false);
      return;
    }
  
    try {
      // Step 1: Verify OTP
      const response = await fetch(`${BACKEND_URL}/api/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
  
      if (response.ok) {
        // Step 2: Sign-in or sign-up
        const username = email.split('@')[0];
        const res = await fetch(`${BACKEND_URL}/api/v1/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, type: 'User' }),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          const { token, userId } = data;
  
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);
  
          router.push('/home/spaces');
        } else {
          setError(data.message || 'Failed to sign in.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative">
        <div className="absolute left-4 top-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => router.push('/accounts/signin')}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Authentication Code
          </h1>
          <p className="text-gray-600 mb-8">
            We just emailed a 6-digit code to <strong>{email}</strong>. If you
            don't see it, please check your spam folder.
          </p>

          <div className="flex gap-2 justify-center mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el: HTMLInputElement | null) => {
                  if (el) inputRefs.current[index] = el;
                }}
                className="w-12 h-12 border-2 rounded-lg text-center text-lg font-semibold
                          focus:border-primary focus:outline-none
                          transition-colors"
                pattern="[0-9]*"
                inputMode="numeric"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 bg-black text-white font-semibold rounded-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            } transition-colors`}
          >
            {loading ? 'Verifying...' : 'Submit'}
          </button>

          <p className="text-sm text-gray-500 mt-4">
            By signing in, you are confirming that you agree to the{' '}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-primary hover:underline">
              Terms and Conditions
            </Link>{' '}
            of the Z Meteverse platform.
          </p>
        </div>
      </div>
    </div>
  );
}