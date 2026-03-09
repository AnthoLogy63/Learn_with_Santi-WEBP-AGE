import { useOutletContext } from "react-router-dom";
import ExamManagement from "@/components/admin/ExamManagement";
import ResultsDashboard from "@/components/admin/ResultsDashboard";
import DataManagement from "@/components/admin/DataManagement";

const AdminDashboard = () => {
    const { activeTab } = useOutletContext<{ activeTab: string }>();

    return (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-12 animate-fade-in">
            {activeTab === "management" && <ExamManagement />}
            {activeTab === "results" && <ResultsDashboard />}
            {activeTab === "data" && <DataManagement />}
        </div>
    );
};

export default AdminDashboard;
