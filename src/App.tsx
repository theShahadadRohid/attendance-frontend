import { BiCheckCircle } from "react-icons/bi";

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
          <BiCheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Attendance System</h1>

        <p className="mt-2 text-sm text-slate-500">
          Frontend project is successfully configured.
        </p>

        <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
          React + TypeScript + Tailwind CSS are ready.
        </div>
      </div>
    </main>
  );
}

export default App;
