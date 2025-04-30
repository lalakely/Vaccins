import HameauList from "../components/Hameau/HameauList";
import HameauAdd from "../components/Hameau/HameauAdd";
import NavBar from "../components/main/NavBar";

function Hameau (){
    return (
        <>
            <NavBar />
            <HameauAdd />
            <HameauList />
        </>
    );
}

export default Hameau;