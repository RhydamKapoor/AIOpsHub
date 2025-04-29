import { useBoolToggle } from "react-haiku";
import { Eye, EyeClosed } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosConfig";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { signupSchema } from "@/utils/Validation";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignupForm() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "user",
    },
  });
  const [show, setShow] = useBoolToggle();
  const router = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const getRole = query.get("role");

  const onSubmit = async (data) => {
    if (data) {
      const toastId = toast.loading("Saving details...");
      try {
        const response = await axiosInstance.post("auth/register", data);
        if (response.status === 200) {
          toast.success("Account created successfully", { id: toastId });
          router("/login");
        } else {
          toast.error("Account creation failed", { id: toastId });
        }
        console.log(response);
      } catch (error) {
        toast.error(error.response.data.msg, { id: toastId });
        console.log(error);
      }
    }
  };
  
  useEffect(() => {
    if(getRole){
      setValue("role", getRole);
    }else{
      router('/role-selection')
    }
  }, []);
  return (
    <div className="flex flex-col items-center gap-y-5 w-full">
      <h1 className="text-4xl font-bold uppercase py-2 px-3">
        Signin as {watch("role")}
      </h1>
      <form
        className="flex flex-col w-full gap-y-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex sm:flex-row flex-col sm:*:w-1/2 *:w-full gap-x-3">
          <div className="flex flex-col">
            <div className="flex flex-col relative">
              <label
                htmlFor="firstName"
                className={`"capitalize translate-x-4`}
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="capitalize w-full border rounded-full outline-none px-5 py-2.5 peer text-[var(--withdarkinnertext)]"
                {...register("firstName")}
              />
            </div>
            <p
              className={`${
                errors?.firstName ? `visible` : `invisible`
              } pl-2 text-red-500 text-sm`}
            >
              {errors?.firstName?.message || `Error`}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col relative">
              <label htmlFor="lastName" className={`capitalize translate-x-4`}>
                last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="capitalize w-full border rounded-full outline-none px-5 py-2.5 peer text-[var(--withdarkinnertext)]"
                {...register("lastName")}
              />
            </div>
            <p
              className={`${
                errors?.lastName ? `visible` : `invisible`
              } pl-2 text-red-500 text-sm`}
            >
              {errors?.lastName?.message || `Error`}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <div className="flex flex-col relative">
            <label htmlFor="email" className={`capitalize translate-x-4`}>
              email
            </label>
            <input
              type="text"
              id="email"
              className="lowercase w-full border rounded-full outline-none px-5 py-2.5 peer text-[var(--withdarkinnertext)]"
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

        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className={`capitalize translate-x-4`}>
            password
          </label>
          <div className="flex flex-col relative">
            <input
              type={!show ? "password" : "text"}
              id="password"
              className="w-full border rounded-full outline-none px-5 py-2.5 pr-14 peer text-[var(--withdarkinnertext)]"
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
          <p
            className={`${
              errors?.password ? `visible` : `invisible`
            } pl-2 text-red-500 text-sm`}
          >
            {errors?.password?.message || `Error`}
          </p>
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
            Signup
          </button>
          <p className="text-[var(--lightText)] text-md">
            Already a user?{" "}
            <Link to="/login" className="text-[var(--dark-btn)] font-semibold">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
