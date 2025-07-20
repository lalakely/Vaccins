import { buildApiUrl } from "../../config/api";
import { useEffect, useState } from "react";

function VaccineStockTable() {
  const [vaccins, setVaccins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(buildApiUrl("/api/vaccins"));
      const data = await res.json();
      setVaccins(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">État des Stocks de Vaccins</h2>
      {loading ? (
        <div className="h-64 flex items-center justify-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Nom</th>
                <th className="p-2">Arrivée</th>
                <th className="p-2">Péremption</th>
                <th className="p-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {vaccins.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="p-2">{v.Nom}</td>
                  <td className="p-2">{new Date(v.Date_arrivee).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(v.Date_peremption).toLocaleDateString()}</td>
                  <td className="p-2">
                    {new Date(v.Date_peremption) > new Date() ? (
                      <span className="text-green-600">Actif</span>
                    ) : (
                      <span className="text-red-600">Périmé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VaccineStockTable;