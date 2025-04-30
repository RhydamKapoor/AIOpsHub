import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBoolToggle } from "react-haiku";
import { FcGoogle } from "react-icons/fc";
import { FaSlack } from "react-icons/fa";
import { Eye, EyeClosed } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "../../../utils/Validation";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosConfig";

export default function LoginForm({tabs, setTabs}) {
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const [show, setShow] = useBoolToggle();
  const router = useNavigate();

  const onSubmit = async (data) => {
    if(data){
      const toastId = toast.loading("Checking credentials...");
      try {
        const response = await axiosInstance.post("auth/login", data);
        if(response.status === 200){
          toast.success("Welcome user!", {id: toastId});
          router("/");
        }else{
          toast.error("Login failed", {id: toastId});
        }
      } catch (error) {
        toast.error(error.response.data.msg, {id: toastId});
        console.log(error);
      }
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  const handleSlackLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/slack`;
  };

  return (
    <div className="flex flex-col items-center gap-y-5 w-full">
      <h1 className="text-4xl font-bold uppercase p-3">Welcome</h1>
      <form className="flex flex-col w-full gap-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col">
          <div className="flex flex-col relative">
            <label htmlFor="email" className={`capitalize translate-x-4`}>
              email
            </label>
            <input
              type="text"
              id="email"
              className="w-full border rounded-full outline-none px-5 py-2.5 peer lowercase"
              {...register("email")}
            />
          </div>
          <p
            className={`${
              errors?.email ? `visible` : `invisible`
            } pl-2 text-red-500 text-sm`}
          >
            {errors?.email?.message || `Error`}
          </p>
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className={`capitalize translate-x-4`}>
            password
          </label>
          <div className="relative">
            <input
              type={!show ? "password" : "text"}
              id="password"
              className="w-full border rounded-full outline-none px-5 py-2.5 pr-14 peer"
              {...register("password")}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer">
              {show ? (
                <Eye size={20} onClick={() => setShow()} />
              ) : (
                <EyeClosed size={20} onClick={() => setShow()} />
              )}
            </span>
          </div>
          <div className="flex justify-between ">
          <p
            className={`${
              errors?.password ? `visible` : `invisible`
            } pl-2 text-red-500 text-sm`}
          >
            {errors?.password?.message || `Error`}
          </p>
            <button type="button" className="text-sm cursor-pointer" onClick={() => setTabs({...tabs, loginInfo: false, forgotPassword: true})}>
              Forgot Password?
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-y-4 items-center w-full relative">
          {/* <span className={` text-sm absolute -top-7 flex gap-x-1 items-center ${(messages.errorMsg || messages.loadMsg) ? `visible` : `invisible`}`}>
                  {messages.errorMsg && <span className="text-red-500 flex justify-center items-center"><X size={18} strokeWidth={2.6}/>{messages.errorMsg}</span>}
                  {messages.loadMsg && <span className="text-slate-700 animate-pulse flex justify-center items-center">{messages.loadMsg}</span>}
                  {messages.successMsg && <span className="text-green-600 animate-pulse flex justify-center items-center">{messages.successMsg}</span>}
                  <span className={` ${(messages.errorMsg || messages.loadMsg) ? `hidden` : `block`}`}>message</span>
                </span> */}
          <button
            type="submit"
            className="bg-[var(--color-neutral)] text-[var(--color-neutral-content)] py-3 w-full rounded-full font-bold cursor-pointer"
          >
            Login
          </button>
          <span className="text-[var(--lightText)] text-sm">- or -</span>

          <div className="flex max-[1160px]:flex-col items-center justify-center w-full *:w-1/2 max-[1160px]:*:w-full text-sm gap-x-5 gap-y-3 *:cursor-pointer *:bg-[var(--color-base-300)] *:text-[var(--color-base-content)]">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-x-2 text-white py-2.5 px-2 rounded-full border"
            >
              <FcGoogle className="text-lg" />
              <span className="font-semibold">Login with Google</span>
            </button>
            <button
              type="button"
              onClick={handleSlackLogin}
              className="w-full flex justify-center items-center gap-x-2 text-white py-2.5 px-2 rounded-full border"
            >
              <FaSlack className="text-purple-600 text-lg" />
              <span className="font-semibold">Login with Slack</span>
            </button>
          </div>
          <p className="text-[var(--lightText)] text-md">
            New user?{" "}
            <Link to="/role-selection" className="text-[var(--dark-btn)] font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
