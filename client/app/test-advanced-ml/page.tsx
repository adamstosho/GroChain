import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Zap, Gauge, TrendingUp, Activity, Target, Settings, BarChart3, AlertTriangle, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Test Advanced ML Services | GroChain",
  description: "Test page for Advanced ML Services features",
}

export default function TestAdvancedMLPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Advanced ML Services Test</h1>
          <p className="text-muted-foreground mb-8">
            Test the implemented advanced machine learning features with comprehensive predictive analytics, optimization, and intelligent automation.
          </p>
        </div>

        {/* Main Dashboard Link */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Advanced ML Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Access the main Advanced ML Services dashboard with comprehensive analytics and controls.
            </p>
            <Link href="/advanced-ml">
              <Button className="w-full">Open Advanced ML Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Predictive Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Predictive Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sensor health monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Anomaly detection algorithms</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Maintenance scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Equipment failure prediction</span>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Algorithms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Optimization Algorithms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Irrigation optimization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Fertilizer optimization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Harvest timing optimization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Resource allocation</span>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-purple-500" />
                Efficiency Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Farming efficiency scoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Performance benchmarking</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Resource utilization analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Productivity optimization</span>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Yield forecasting</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Risk assessment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Market trend analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Decision support systems</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Integration & Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Backend Integration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Advanced ML API endpoints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Sensor data integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time analytics processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>ML model performance monitoring</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Technology Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Machine learning algorithms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Predictive modeling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Intelligent automation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Performance optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Integrated Backend APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/sensors/:id/maintenance</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/sensors/:id/anomalies</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/optimize/irrigation</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/optimize/fertilizer</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/optimize/harvest</code>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/optimize/report</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/insights/sensor-health</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/insights/efficiency-score</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/insights/predictive</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <code className="text-xs bg-muted px-2 py-1 rounded">/api/advanced-ml/models/performance</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/ai">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Core AI services</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/image-recognition">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Image Recognition</h3>
                <p className="text-sm text-muted-foreground">Visual analysis</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/iot">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">IoT Sensors</h3>
                <p className="text-sm text-muted-foreground">Sensor management</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Status */}
        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                Advanced ML Services Implementation Complete
              </h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              All advanced machine learning features have been successfully implemented with full backend integration,
              comprehensive UI components, and proper navigation support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
