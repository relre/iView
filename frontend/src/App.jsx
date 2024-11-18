import { useState } from 'react'
import logo from './assets/iview-logo.png'; 
import './App.css'



function App() {

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 bg-transparent">
      <img src={logo} className="max-w-[10rem]" alt="logo" />
      
      <a href="/admin/question-packages">
        <button  className="w-full bg-rtwgreen hover:bg-rtwgreendark text-white p-2 rounded">
          Admin Panel Girişi
        </button>
      </a>
    </div>
    </>
  )
}

export default App
