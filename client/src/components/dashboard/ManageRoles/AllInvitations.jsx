import { ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import {motion} from "motion/react"



export default function AllInvitations({invitations, setInvitations}) {
    const [open, setOpen] = useState(false);

    const removeHistory = (id) => {
        const history = invitations.filter((invitee) => invitee.id !== id);
        setInvitations(history)
    }
  return (
    <motion.div className={`flex flex-col gap-y-4 items-center bg-[var(--color-base-300)]/40 py-3 h-auto rounded-lg shadow-xl overflow-hidden`}
    initial={{height: '9%'}}
    animate={{height: open ? "100%" : "9%"}} transition={{duration: 0.4}}
    >
        <div className="flex w-full justify-center items-center relative cursor-pointer" onClick={() => setOpen(!open)}>
            <h1 className="capitalize text-lg font-bold">History</h1>
            <span className="absolute right-5">{!open ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</span>
        </div>
      <div className={`flex flex-col gap-y-5 w-full p-3 overflow-y-auto`}>
      {
        invitations.map((invitee, i) => {
            return(
                <div className="flex bg-[var(--color-base-100)]/40 p-2 rounded-lg" key={i}>
                    <div className="flex flex-col w-full">
                        <div className="flex w-full">
                        <label htmlFor="email" className="w-14 font-semibold">
                            Email:
                        </label>
                        <input
                            id="email"
                            value={invitee.email}
                            className="w-3/4 outline-none"
                            readOnly
                        />
                        </div>
                        <div className="flex pr-2 gap-x-12">
                            <div className="flex">
                                <h1 className="w-14 font-semibold">Role:</h1>
                                <span>Editor</span>
                            </div>
                            <div className="flex">
                                <h1 className="w-14 font-semibold">Status:</h1>
                                <span className={`${invitee.status === "Sent" ? `text-orange-700` : `text-red-700`}`}>{invitee.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <span className="text-red-700 cursor-pointer" onClick={() => removeHistory(invitee.id)}><X size={18}/></span>
                    </div>
                </div>
            )
        })
      }
        
      </div>
    </motion.div>
  );
}
