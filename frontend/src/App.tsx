import './App.css'
import { BrowserRouter as Router ,Routes  , Route } from 'react-router-dom'
import Child from './pages/Child'
import Vaccine from './pages/Vaccine'
import NavBar from './components/main/NavBar'


function App() {
  return (
   <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Child />} />
        <Route path="/Vaccins" element={<Vaccine />} />
      </Routes>
   </Router>
  )
}

export default App;
