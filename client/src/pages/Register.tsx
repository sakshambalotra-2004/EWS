import { useState } from "react"

export default function Register(){

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [role,setRole] = useState("student")

  const handleRegister = async (e:any)=>{
    e.preventDefault()

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

    alert(data.message)
  }

  return(

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <input
        placeholder="Name"
        className="w-full border p-2 mb-4 rounded"
        onChange={(e)=>setName(e.target.value)}
        required
        />

        <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-4 rounded"
        onChange={(e)=>setEmail(e.target.value)}
        required
        />

        <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-4 rounded"
        onChange={(e)=>setPassword(e.target.value)}
        required
        />

        <select
        className="w-full border p-2 mb-4 rounded"
        onChange={(e)=>setRole(e.target.value)}
        >

          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="counselor">Counselor</option>
          <option value="admin">Admin</option>

        </select>

        <button
        className="w-full bg-blue-600 text-white p-2 rounded"
        >
        Sign Up
        </button>

      </form>

    </div>
  )
}