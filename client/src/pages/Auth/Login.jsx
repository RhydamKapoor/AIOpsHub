import { useEffect, useState } from "react";
import AtroposComp from "../../components/auth/Atropos";
import LoginForm from "../../components/auth/logincomp/LoginForm";
import ForgotPassword from "../../components/auth/logincomp/ForgotPassword";

export default function Login() {
  const [tabs, setTabs] = useState({
    loginInfo: true,
    forgotPassword: false,
  });
  const [prevTab, setPrevTab] = useState({
    text: "",
    tab: () => {},
  });
  const [update, setUpdate] = useState({
    verifyOTP: false,
    newPassword: false,
  });

  useEffect(() => {
    tabs.forgotPassword
      ? setPrevTab({
          text: "Login Info",
          tab: () =>
            setTabs({
              loginInfo: true,
              forgotPassword: false,
            }),
        })
      : setPrevTab({ text: "", tab: "" });
    setUpdate({
      verifyOTP: false,
      newPassword: false,
    });
  }, [tabs]);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-full *:w-1/3 overflow-hidden">
        <AtroposComp prevTab={prevTab} update={update}>
          {tabs.loginInfo ? (
            <LoginForm tabs={tabs} setTabs={setTabs} />
          ) : (
            <ForgotPassword update={update} setUpdate={setUpdate} setTabs={setTabs} />
          )}
        </AtroposComp>
      </div>
    </>
  );
}
