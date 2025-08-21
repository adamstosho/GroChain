import { DebugAuth } from "@/components/debug-auth"

export default function DebugAuthPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Authentication Debug</h1>
      <DebugAuth />
    </div>
  )
}

