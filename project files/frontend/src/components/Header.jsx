import { Stethoscope } from "lucide-react";
import React from "react";
import { FiHome, FiLogOut, FiUser } from "react-icons/fi";

export default function Header({ title, onProfileClick }) {
  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4">
      <button  className="text-xl text-blue-600 hover:text-blue-800 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              DocSpot
            </span>
      </button>
      <h1 className="text-black text-2xl font-semibold ml-0 pl-0">{title}</h1>
      <button onClick={()=>{localStorage.removeItem("token");window.location.href="/login"}} className="text-xl text-gray-600 hover:text-gray-800">
        <FiLogOut />
      </button>
    </header>
  );
}
