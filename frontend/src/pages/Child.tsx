import ChildList from "../components/Child/ChildList";
import AddChild from "../components/Child/AddChild";
import NavBar from "../components/main/NavBar";

function Child(){
    return <>
        <NavBar />
        <div className="flex flex-col item-center">
            <AddChild />
            <ChildList/>
        </div>
        
    </>
}

export default Child;