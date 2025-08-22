"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Send, 
  MessageSquare,
  Shield
} from "lucide-react"
import { useSocket } from "./socket-provider"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface WebSocketEvent {
  id: string
  event: string
  data: any
  timestamp: string
  direction: 'incoming' | 'outgoing'
}

export function WebSocketDashboard() {
  const { user } = useAuth()
  const { 
    socket, 
    connected, 
    reconnect, 
    sendMessage, 
    subscribeToEvent
  } = useSocket()
  
  const [customEvent, setCustomEvent] = useState("")
  const [customData, setCustomData] = useState("")
  const [eventHistory, setEventHistory] = useState<WebSocketEvent[]>([])

  const handleSendCustomEvent = () => {
    if (!customEvent.trim()) {
      toast.error("Please enter an event name")
      return
    }

    try {
      const data = customData.trim() ? JSON.parse(customData) : {}
      sendMessage(customEvent, data)
      
      const event: WebSocketEvent = {
        id: Date.now().toString(),
        event: customEvent,
        data,
        timestamp: new Date().toISOString(),
        direction: 'outgoing'
      }
      
      setEventHistory(prev => [event, ...prev.slice(0, 99)])
      setCustomEvent("")
      setCustomData("")
      toast.success("Event sent successfully")
    } catch (error) {
      toast.error("Invalid JSON data")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please log in to access WebSocket services</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">WebSocket Real-time Services</h1>
          <p className="text-muted-foreground">
            Monitor and manage real-time WebSocket connections and events
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {connected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                <span className="font-medium">Connection Status: {connected ? "Connected" : "Disconnected"}</span>
              </div>
              <Button onClick={reconnect} disabled={connected}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Wifi className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{connected ? 1 : 0}</p>
              <p className="text-sm text-muted-foreground">Active Connections</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Send className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{eventHistory.filter(e => e.direction === 'outgoing').length}</p>
              <p className="text-sm text-muted-foreground">Messages Sent</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{eventHistory.filter(e => e.direction === 'incoming').length}</p>
              <p className="text-sm text-muted-foreground">Messages Received</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Custom Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Event name..."
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
              />
              <Input
                placeholder='Event data (JSON)'
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSendCustomEvent}
              disabled={!connected || !customEvent.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Event
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event History</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setEventHistory([])}>
                Clear History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {eventHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No events logged yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {eventHistory.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${
                      event.direction === 'incoming' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        event.direction === 'incoming' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }>
                        {event.direction === 'incoming' ? 'Received' : 'Sent'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-mono text-sm">{event.event}</p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto mt-2">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
