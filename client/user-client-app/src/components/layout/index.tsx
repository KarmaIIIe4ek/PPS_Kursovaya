import React from 'react'
import { Header } from '../header'
import { Container } from '../container'
import { NavBar } from '../nav-bar'
import { Outlet } from 'react-router-dom'
import watermark from '../../public/images/watermark.svg'

export const Layout = () => {
  return (
    <React.Fragment>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.1, // Регулируйте прозрачность здесь
          backgroundColor: 'gray',
        }}
      />
            <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '40vw', // Регулируйте размер по необходимости
          height: '40vh',
          zIndex: 0,
          opacity: 0.2, // Регулируйте прозрачность здесь
          backgroundImage: `url(${watermark})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right bottom',
          backgroundSize: 'contain'
        }}
      />
      
      
      <Header />
      <Container>
        <div className="flex-2" style={{zIndex: 1}}>
          <NavBar />
        </div>
        <div className="flex-1 p-4" style={{zIndex: 0}}>
          <Outlet/>
        </div>
      </Container>
    </React.Fragment>
  )
}