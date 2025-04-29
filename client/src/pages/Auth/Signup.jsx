import { useEffect, useState } from "react";
import AtroposComp from "../../components/auth/Atropos";
import SignupForm from "../../components/auth/signcomp/SignupForm";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    
    const [tabs, setTabs] = useState({
        signupInfo: true,
        emailVerification: false,
    })
    const [prevTab, setPrevTab] = useState({
        text: "",
        tab: () => {},
    });
    const navigate = useNavigate();
     

    useEffect(() => {
        tabs.signupInfo ? setPrevTab({text: "Role Selection", tab: () => navigate("/role-selection") }) : tabs.emailVerification && setPrevTab({text: "Signup Info", tab: () => setTabs({signupInfo: true, emailVerification: false})});
    }, [tabs]);

  return (
    <div className="flex flex-col justify-center items-center h-full *:w-fit overflow-hidden">
      <AtroposComp prevTab={prevTab}>
        <SignupForm />
      </AtroposComp>
    </div>
  );
}
