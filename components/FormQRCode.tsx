'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface FormQRCodeProps {
  formUrl: string
}

export function FormQRCode({ formUrl }: FormQRCodeProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    try {
      // Get the SVG element
      const svg = document.getElementById('form-qr-code')
      if (!svg) return

      // Create a canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Create an image from the SVG
      const img = new Image()
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        // Set canvas size
        canvas.width = 300
        canvas.height = 300

        // Draw white background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw QR code
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convert to PNG and download
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = 'form-qr-code.png'
        downloadLink.href = pngFile
        downloadLink.click()

        // Cleanup
        URL.revokeObjectURL(url)
        setIsDownloading(false)
      }

      img.src = url
    } catch (error) {
      console.error('Error downloading QR code:', error)
      setIsDownloading(false)
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">QR Code</h2>
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            id="form-qr-code"
            value={formUrl}
            size={200}
            level="H"
            includeMargin
          />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Scan to access the form</p>
          <p className="text-sm text-gray-600 break-all">{formUrl}</p>
        </div>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          variant="outline"
        >
          {isDownloading ? 'Downloading...' : 'Download QR Code'}
        </Button>
      </div>
    </div>
  )
} 