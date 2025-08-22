import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Test Fintech | GroChain",
  description: "Test page for fintech features",
}

export default function TestFintechPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Fintech Features Test</h1>
          <p className="text-muted-foreground mb-8">
            Test the implemented fintech features using real backend APIs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fintech Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Main fintech services dashboard with credit scores and loan referrals
              </p>
              <Link href="/fintech">
                <Button>View Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credit Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Detailed credit score analysis based on transaction history
              </p>
              <Link href="/fintech/credit-score">
                <Button>View Credit Score</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Referral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Apply for loan referrals to partner financial institutions
              </p>
              <Link href="/fintech/apply-loan">
                <Button>Apply for Referral</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Test fintech navigation in dashboard
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">API Integration Status</h3>
            <p className="text-sm text-blue-700">
              ✅ Credit Score API: <code>/api/fintech/credit-score/:farmerId</code><br/>
              ✅ Loan Referral API: <code>/api/fintech/loan-referrals</code><br/>
              ✅ No mock data - using real backend APIs only
            </p>
          </div>
          
          <Link href="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
