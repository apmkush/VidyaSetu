import React from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { Outlet } from 'react-router-dom'   // => this helps to keep all components (like-> header, footer, etc..) of webpage (fix)same i.e, uses this layout as base UI of webPage , and components inside outlet get changes in this webPage



export default function Layout() {
  return (
    <>
       <Header/>
        <Outlet/>
      <Footer/>
    </>
  )
}
