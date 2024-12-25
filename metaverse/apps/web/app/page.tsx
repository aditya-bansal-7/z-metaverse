import React, { useState } from 'react'
import Navbar from './utils/Navbar'

const page = () => {
  const [user, setUser] = useState({});

  

  return (
    <>
      <Navbar user={user} />
    </>
  )
}

export default page