"use client";
import React, { useEffect } from 'react'
import Navbar from '../../utils/Navbar'

const page = () => {

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        console.log(userId);
        if (userId) {
            
        }
    },[])
  return (
    <>
    <Navbar user={null} />
    <div>
        <h1 className='text-4xl text-white font-bold'>Spaces</h1>
    </div>
    </>
  )
}

export default page