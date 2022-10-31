import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.scss';

function App() {
  return (
    <Router>  
      <div className="App">
        <Routes>
          <Route path='/' element={< Home />}></Route>
          <Route path='/login' element={< Login />}></Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
