'use client';
import React, { useEffect, useState } from 'react';
import Navbar from './utils/Navbar';
import { User } from './types';
import { BACKEND_URL } from './config';

const Page = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const res = await fetch(`${BACKEND_URL}/api/v1/user/${userId}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch user: ${res.statusText}`);
          }
          const { user } = (await res.json()) as { user: User };
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <Navbar user={user} />
      <div className='h-screen '>

      </div>
      <div className='h-screen '>

      </div>
      <div className='h-screen '>
        
      </div>
    </>
  );
};

export default Page;
