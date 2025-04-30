import AddVaccine from "../components/Vaccine/AddVaccine";
import VaccineList from "../components/Vaccine/VaccineList";
import NavBar from "../components/main/NavBar";

function Vaccine(){
    return <>
        <NavBar />
        <AddVaccine />
        <VaccineList />
    </>
}

export default Vaccine;