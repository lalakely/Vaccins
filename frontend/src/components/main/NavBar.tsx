import { Link } from "react-router-dom";

function NavBar(){
    return <>
        <Link to="/">Enfants</Link>
        <Link to="/Vaccins">Vaccins</Link>
    </>
}

export default NavBar;