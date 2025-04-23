import { useEffect, useState } from "react";
import AtroposComp from "../../components/auth/Atropos";
import LoginForm from "../../components/auth/logincomp/LoginForm"; 
import ForgotPassword from "../../components/auth/logincomp/ForgotPassword";

export default function Login() {
  const [tabs, setTabs] = useState({
    personalInfo: true,
    forgotPassword: false,
})
const [prevTab, setPrevTab] = useState({
    text: "",
    tab: () => {},
});
useEffect(() => {
  tabs.forgotPassword ? setPrevTab({text: "Personal Info", tab: () => setTabs({personalInfo: true, forgotPassword: false})}): setPrevTab({text: "", tab: ""})
}, [tabs]);
  return (
    <>
      <div className="flex flex-col justify-center items-center h-full *:w-1/3">
        <AtroposComp prevTab={prevTab}>
          {tabs.personalInfo ? <LoginForm tabs={tabs} setTabs={setTabs}/> : <ForgotPassword tabs={tabs} setTabs={setTabs}/>}
        </AtroposComp>
      </div>
    </>
  );
}
