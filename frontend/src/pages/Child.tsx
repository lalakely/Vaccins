import ChildList from "../components/Child/ChildList";
import AddChild from "../components/Child/AddChild";
import NavBar from "../components/main/NavBar";

function Child(){
    return <>
        <NavBar />
        
            <AddChild />
            <ChildList/>

        
    </>
}

export default Child;