import axiosInstance from '@/utils/axiosConfig';
import { invitationSchema } from '@/utils/Validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast';
import { v4 as uuid} from "uuid"

export default function SendInvitation({invitations, setInvitations}) {
    const {register, handleSubmit, reset, setValue, formState: {errors}} = useForm({
        resolver: zodResolver(invitationSchema)
    });

    const sendInvitation = async (data) => {
        if(data){
            const toastId = toast.loading('Sending...')
            try {
                const response = await axiosInstance.post('/sendInvitation', data);
                console.log(response.data);
                toast.success('Invitation sent successfully!', {id: toastId});
                setInvitations([{ ...data, id: uuid(), status: "Sent" }, ...invitations]);
                reset();
                setValue('role', 'Editor')
            } catch (error) {
                toast.error(error.response.data.msg, {id: toastId});
                setInvitations([{ ...data, id: uuid(), status: "Failed" }, ...invitations]);
                console.log(error);
            }
        }
    }

  return (
    <form className="flex flex-col gap-y-1 items-center bg-[var(--color-base-300)]/40 py-3 rounded-lg shadow-xl" onSubmit={handleSubmit(sendInvitation)}>
        <h1 className="capitalize text-lg font-bold">Invite users</h1>
        <div className="flex flex-col items-center w-full justify-center">
          <input type="text" placeholder="Enter email" className="outline-none w-11/12 border p-2 rounded-lg text-center" {...register('email')}/>
          <p className={`${errors?.email?.message ? `visible` : `invisible`} text-red-600 text-sm`}>{errors?.email?.message || `Error`}</p>
        </div>
        <div className="flex flex-col w-full justify-center items-center select-none">
          <h1 className="text-lg">Select role</h1>
          <div className="flex gap-x-6">
            <div className="flex gap-x-2 *:cursor-pointer">
              <label htmlFor="editor">Editor</label>
              <input type="radio" name="role" id="editor" value='Editor' {...register('role')} defaultChecked/>
            </div>
            <div className="flex gap-x-2 *:cursor-pointer">
              <label htmlFor="viewer">Viewer</label>
              <input type="radio" name="role" id="viewer" value='Viewer' {...register('role')}/>
            </div>
          </div>
          <p className={`${errors?.role?.message ? `visible` : `invisible`} text-red-600 text-sm`}>{errors?.role?.message || `Error`}</p>
        </div>
        <div className="flex">
          <button className="flex gap-x-0.5 justify-center items-center bg-[var(--color-neutral)] text-[var(--color-neutral-content)] p-2 rounded-lg cursor-pointer"> <Send size={16}/> Send invitation </button>
        </div>
      </form>
  )
}
