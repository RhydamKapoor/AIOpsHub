import { useEffect, useState } from "react";
import AtroposComp from "../../components/auth/Atropos";
import SignupForm from "../../components/auth/signcomp/SignupForm";
import RoleAssign from "../../components/auth/signcomp/roleAssign";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../utils/Validation";
import { useForm } from "react-hook-form";

export default function Singup() {
    const {
      register,
      watch,
      setValue,
      formState: { errors },
      handleSubmit,
    } = useForm({
      zodResolver: zodResolver(signupSchema),
    });
    const [tabs, setTabs] = useState({
        roleSelection: true,
        personalInfo: false,
        emailVerification: false,
        forgotPassword: false,
    })
    const [prevTab, setPrevTab] = useState({
        text: "",
        tab: () => {},
    });
    console.log(watch());
    
    // useEffect(() => {
    //     setTabs({
    //         roleSelection: true,
    //         personalInfo: false,
    //         emailVerification: false,
    //         forgotPassword: false,
    //     })
    // }, []);
    useEffect(() => {
        tabs.roleSelection ? setPrevTab({text: "", tab: ""}) : tabs.personalInfo ? setPrevTab({text: "Role Selection", tab: () => setTabs({roleSelection: true, personalInfo: false})}) : tabs.emailVerification ? setPrevTab({text: "Personal Info", tab: () => setTabs({personalInfo: true, emailVerification: false})}) : tabs.forgotPassword && setPrevTab({text: "Personal Info", tab: () => setTabs({personalInfo: true, forgotPassword: false})});
    }, [tabs]);

  return (
    <div className="flex flex-col justify-center items-center h-full *:w-fit">
      <AtroposComp prevTab={prevTab}>
        {tabs.roleSelection ? <RoleAssign tabs={tabs} setTabs={setTabs} setValue={setValue} errors={errors} /> : <SignupForm register={register} errors={errors} watch={watch} />}
      </AtroposComp>
    </div>
  );
}
