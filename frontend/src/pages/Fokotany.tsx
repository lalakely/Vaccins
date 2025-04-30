import FokotanyAdd from "../components/Fokotany/FokotanyAdd";
import FokotanyList from "../components/Fokotany/FokotanyList";
import NavBar from "../components/main/NavBar";

function Fokotany (){
    return (
        <>  
            <NavBar />
            <FokotanyAdd />
            <FokotanyList />
        </>
    );
}

export default Fokotany;