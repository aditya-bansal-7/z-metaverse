"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dotenv from "dotenv";
import { BACKEND_URL } from "../../config";

dotenv.config();

const page = () => {
  let [email, setEmail] = useState("");
  let [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/send-otp`, {
        email
      });

      if (response.status === 200) {
        sessionStorage.setItem("email", email);
        router.push("/accounts/confirm");
      } else {
        alert("Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-24">
      <div className="w-96 h-full bg-white rounded-xl p-8 flex flex-col items-center justify-center shadow-2xl ">
        <img
          src="/ZMetaverse.png"
          className=" object-contain h-14 mb-5"
          alt="Logo"
        />
        <button className="cursor-pointer text-black flex gap-2 items-center bg-white w-full justify-center border-2 border-slate-200 px-4 py-2 mb-3 rounded-lg font-medium text-sm hover:bg-slate-100 transition-all ease-in duration-200">
          <svg
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6">
            <path
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              fill="#FFC107"></path>
            <path
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              fill="#FF3D00"></path>
            <path
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              fill="#4CAF50"></path>
            <path
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              fill="#1976D2"></path>
          </svg>
          Sign in with Google
        </button>
        <button className="cursor-pointer text-black flex gap-2 items-center bg-white w-full justify-center border-2 border-slate-200 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100 transition-all ease-in duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="rgb(36, 161, 222)"
            viewBox="0 0 26 26">
            <path d="M2.14753 11.8099C7.3949 9.52374 10.894 8.01654 12.6447 7.28833C17.6435 5.20916 18.6822 4.84799 19.3592 4.83606C19.5081 4.83344 19.8411 4.87034 20.0567 5.04534C20.2388 5.1931 20.2889 5.39271 20.3129 5.5328C20.3369 5.6729 20.3667 5.99204 20.343 6.2414C20.0721 9.08763 18.9 15.9947 18.3037 19.1825C18.0514 20.5314 17.5546 20.9836 17.0736 21.0279C16.0283 21.1241 15.2345 20.3371 14.2221 19.6735C12.6379 18.635 11.7429 17.9885 10.2051 16.9751C8.42795 15.804 9.58001 15.1603 10.5928 14.1084C10.8579 13.8331 15.4635 9.64397 15.5526 9.26395C15.5637 9.21642 15.5741 9.03926 15.4688 8.94571C15.3636 8.85216 15.2083 8.88415 15.0962 8.9096C14.9373 8.94566 12.4064 10.6184 7.50365 13.928C6.78528 14.4212 6.13461 14.6616 5.55163 14.649C4.90893 14.6351 3.67265 14.2856 2.7536 13.9869C1.62635 13.6204 0.730432 13.4267 0.808447 12.8044C0.849081 12.4803 1.29544 12.1488 2.14753 11.8099Z"></path>
          </svg>
          Sign in with Telegram
        </button>
        <p className="text-center text-sm text-slate-500 mt-3">or</p>
        <div className="w-full">
          <h3 className="text-md font-bold text-slate-800 mt-3">Email</h3>
        </div>

        <input
          type="email"
          name="inputname"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="Enter your email"
          className="block w-full mt-1 rounded-md py-1.5 px-2 ring-1 ring-inset ring-slate-200 focus:text-gray-800"
        />

        <button
          onClick={() => {
            handleSignIn();
          }}
          className="cursor-pointer h-12 mt-2 text-white flex gap-2 items-center bg-[#8446fe] w-full justify-center border-2 border-slate-200 px-4 py-2 mb-3 rounded-lg font-bold text-sm hover:bg-[#8250e4] transition-all ease-in duration-200">
          {isLoading ? "Loading..." : "Sign in with Email"}
        </button>
        <p className="text-center text-sm text-slate-500 ">
          By signing in, you are confirming that you agree to the{" "}
          <span className="underline">Privacy Policy</span> and{" "}
          <span className="underline">Terms and Conditions</span> of the
          Metaverse platform.
        </p>
      </div>
    </div>
  );
};

export default page;
