import React from 'react'
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Forms from './components/Forms'


const server = "https://localhost:5000";




const App = () => {
  return (
    <div className="container">
      
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              <Forms />
            } />
          <Route
            path="/:roomId" />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
