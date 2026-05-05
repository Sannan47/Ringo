import Sidebar from "../../components/Sidebar";
import ChatPanel from "../../components/ChatPanel";

export default function DashboardPage() {
  return (
    <div className="flex w-full flex-1">
      <Sidebar />
      <ChatPanel />
    </div>
  );
}
