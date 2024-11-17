import ChildList from "../components/Child/ChildList";
import AddChild from "../components/Child/AddChild";

function Child(){
    return <>
        <div className="flex flex-col item-center">
            <AddChild />
            <ChildList/>
        </div>
        
    </>
}

export default Child;