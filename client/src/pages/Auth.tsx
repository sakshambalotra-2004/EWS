import { useState } from "react"

export default function Auth(){

  const [mode,setMode] = useState("login")

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [role,setRole] = useState("student")

  const handleLogin = async (e:any)=>{
    e.preventDefault()

    try{

      const res = await fetch("http://localhost:5000/api/auth/login",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({email,password})
      })

      const data = await res.json()

      if(data.token){
        localStorage.setItem("token",data.token)
        localStorage.setItem("role",data.role)
        window.location.reload()
      }else{
        alert(data.message || "Login failed")
      }

    }catch(err){
      alert("Server error")
    }
  }


  const handleRegister = async (e:any)=>{
    e.preventDefault()

    try{

      const res = await fetch("http://localhost:5000/api/auth/register",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          name,
          email,
          password,
          role
        })
      })

      const data = await res.json()

      alert(data.message || "Registration successful")
      setMode("login")

    }catch(err){
      alert("Server error")
    }
  }

  return(

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white w-[380px] p-8 rounded-xl shadow-lg">

        <div className="flex flex-col items-center mb-6">

          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-3">
            ✓
          </div>

          <h2 className="text-2xl font-bold">SMART-EWS</h2>

          <p className="text-sm text-gray-500 text-center">
            Smart Early Warning System for Students
          </p>

        </div>


        <div className="flex bg-gray-100 rounded-lg p-1 mb-5">

          <button
            onClick={()=>setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode==="login"
              ? "bg-white shadow"
              : "text-gray-500"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={()=>setMode("register")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode==="register"
              ? "bg-white shadow"
              : "text-gray-500"
            }`}
          >
            Sign Up
          </button>

        </div>


        {mode==="login" && (

          <form onSubmit={handleLogin}>

            <label className="text-sm">Email</label>

            <input
              type="email"
              className="w-full border rounded-lg p-2 mt-1 mb-4"
              onChange={(e)=>setEmail(e.target.value)}
              required
            />

            <label className="text-sm">Password</label>

            <input
              type="password"
              className="w-full border rounded-lg p-2 mt-1 mb-5"
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <button className="w-full bg-emerald-600 text-white py-2 rounded-lg">
              Sign In
            </button>

          </form>

        )}


        {mode==="register" && (

          <form onSubmit={handleRegister}>

            <label className="text-sm">Name</label>

            <input
              className="w-full border rounded-lg p-2 mt-1 mb-3"
              onChange={(e)=>setName(e.target.value)}
              required
            />

            <label className="text-sm">Email</label>

            <input
              type="email"
              className="w-full border rounded-lg p-2 mt-1 mb-3"
              onChange={(e)=>setEmail(e.target.value)}
              required
            />

            <label className="text-sm">Password</label>

            <input
              type="password"
              className="w-full border rounded-lg p-2 mt-1 mb-3"
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <label className="text-sm">Role</label>

            <select
              className="w-full border rounded-lg p-2 mt-1 mb-5"
              onChange={(e)=>setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="counselor">Counselor</option>
              <option value="admin">Admin</option>
            </select>

            <button className="w-full bg-emerald-600 text-white py-2 rounded-lg">
              Sign Up
            </button>

          </form>

        )}

      </div>

    </div>
  )
}