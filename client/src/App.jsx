import React from 'react'
import { Route, Routes } from 'react-router'
//pages
import Home from './Pages/Home'
import Products from './Pages/Products'
import Contact from './Pages/Contact' 
import SiteShell from './Components/layout/SiteShell'

const App = () => {
  return (
    <SiteShell>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/products' element={<Products />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
    </SiteShell>
  )
}

export default App
