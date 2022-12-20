import Link from "next/link";

export default function Layout({ children }: any) {
  return (
    <div className="min-h-screen min-w-screen bg-slate-900">
      <div className="min-w-screen flex flex-col justify-center items-center bg-gray-900 p-20">
        {children}
      </div>
    </div>
  );
}
