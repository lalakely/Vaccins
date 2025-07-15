import NavBar from "../components/main/NavBar"; // Assumé existant
import Dashboard from "../components/dashboard/Dashboard";

function DashboardPage() {

  return (
    <div className="min-h-screen ">
      <NavBar />
      <div className="lg:ml-30 w-[100%]">
        <Dashboard />
      </div>
    </div>
  );
}

export default DashboardPage;