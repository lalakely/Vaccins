import './App.css'
import { BrowserRouter as Router ,Routes  , Route } from 'react-router-dom'
import Child from './pages/Child'
import Vaccine from './pages/Vaccine'
import NavBar from './components/main/NavBar'
import Fokotany from './pages/Fokotany'
import Hameau from './pages/Hameau'


function App() {
  return (
   <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Child />} />
        <Route path="/Vaccins" element={<Vaccine />} />
        <Route path="/Fokotany" element={<Fokotany />}/>
        <Route path="/Hameau" element={<Hameau />}/>
      </Routes>
   </Router>
  )
}

export default App;
