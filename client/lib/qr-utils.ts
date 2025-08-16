// QR Code utilities for generation and management
export interface QRCodeData {
  batchId: string
  cropType: string
  farmerId: string
  harvestDate: string
  location: string
  quantity: string
  unit: string
}

export function generateQRCodeData(harvest: any): QRCodeData {
  return {
    batchId: harvest.qrCode || `QR${Date.now()}`,
    cropType: harvest.cropType,
    farmerId: harvest.farmer?.id || "farmer-1",
    harvestDate: harvest.harvestDate,
    location: harvest.location,
    quantity: harvest.quantity,
    unit: harvest.unit,
  }
}

export function generateQRCodeURL(data: QRCodeData): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://grochain.com"
  return `${baseUrl}/verify/${data.batchId}?data=${encodeURIComponent(JSON.stringify(data))}`
}

export function parseQRCodeData(qrString: string): QRCodeData | null {
  try {
    // Try to parse as URL first
    if (qrString.startsWith("http")) {
      const url = new URL(qrString)
      const dataParam = url.searchParams.get("data")
      if (dataParam) {
        return JSON.parse(decodeURIComponent(dataParam))
      }
      // Extract batch ID from URL path
      const pathParts = url.pathname.split("/")
      const batchId = pathParts[pathParts.length - 1]
      if (batchId) {
        return { batchId } as QRCodeData
      }
    }

    // Try to parse as JSON
    return JSON.parse(qrString)
  } catch {
    // Treat as simple batch ID
    return { batchId: qrString } as QRCodeData
  }
}

export async function downloadQRCode(canvas: HTMLCanvasElement, filename: string) {
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      resolve()
    })
  })
}
