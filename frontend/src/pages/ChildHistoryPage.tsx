import NavBar from "../components/main/NavBar";
import ChildHistory from "../components/Child/ChildHistory";

export default function ChildHistoryPage() {
  return (
    <div className="flex flex-col min-h-screen ">
      <NavBar />
      <main className="flex-1">
        <ChildHistory />
      </main>
    </div>
  );
}
