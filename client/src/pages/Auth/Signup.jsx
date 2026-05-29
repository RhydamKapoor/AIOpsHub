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
    <div className="relative z-30 flex min-h-full flex-col items-center justify-center px-4 py-6 sm:h-full">
      <div className="pointer-events-auto w-full max-w-md sm:max-w-lg">
        <AtroposComp prevTab={prevTab}>
          <SignupForm />
        </AtroposComp>
      </div>
    </div>
  );
}
