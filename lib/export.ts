import PDFDocument from "pdfkit"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import QRCode from "qrcode"
import type { FeedbackEntry } from "@/lib/types"

export interface ExportData {
  title: string
  description?: string
  data: any[]
  metadata?: Record<string, any>
}

// Extend jspdf with autoTable
// This is a common pattern when using jspdf-autotable with TypeScript
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

// Export to CSV
export function exportToCSV(data: ExportData): string {
  if (!data.data || data.data.length === 0) {
    return "No data to export"
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>()
  data.data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key))
  })

  const headers = Array.from(allKeys)
  const csvHeaders = headers.map((header) => `"${header}"`).join(",")

  const csvRows = data.data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header]
        if (value === null || value === undefined) return '""'
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        return `"${String(value).replace(/"/g, '""')}"`
      })
      .join(",")
  })

  return [csvHeaders, ...csvRows].join("\n")
}

// Export to CSV with Blob
export async function exportToCsv(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error("No data to export.")
  }

  const headers = Object.keys(data[0])
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header]
      // Handle null/undefined, escape commas and quotes
      return `"${String(val || "").replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(","))
  }

  const csvString = csvRows.join("\n")
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
  return blob
}

// Export to PDF
export async function exportToPDF(data: ExportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))

      // Header
      doc.fontSize(20).text(data.title, { align: "center" })
      doc.moveDown()

      if (data.description) {
        doc.fontSize(12).text(data.description, { align: "center" })
        doc.moveDown()
      }

      // Metadata
      if (data.metadata) {
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" })
        Object.entries(data.metadata).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, { align: "right" })
        })
        doc.moveDown()
      }

      // Data
      if (data.data && data.data.length > 0) {
        doc.fontSize(14).text("Data:", { underline: true })
        doc.moveDown(0.5)

        data.data.forEach((item, index) => {
          doc.fontSize(12).text(`Entry ${index + 1}:`, { underline: true })
          doc.moveDown(0.2)

          Object.entries(item).forEach(([key, value]) => {
            const displayValue = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)
            doc.fontSize(10).text(`${key}: ${displayValue}`, { indent: 20 })
          })

          doc.moveDown(0.5)

          // Add page break if needed
          if (doc.y > 700) {
            doc.addPage()
          }
        })
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// Export to PDF with jsPDF and autoTable
export async function exportToPdf(data: any[], filename: string, title: string) {
  if (!data || data.length === 0) {
    throw new Error("No data to export.")
  }

  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(title, 14, 20)

  const headers = Object.keys(data[0])
  const body = data.map((row) => headers.map((header) => String(row[header] || "")))

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 30,
    theme: "striped",
    headStyles: { fillColor: [106, 13, 173] }, // Purple color
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      // Example: make first column wider
      0: { cellWidth: 30 },
    },
  })

  return doc.output("blob")
}

// Function to convert feedback data to CSV format
export function convertToCsv(data: FeedbackEntry[]): string {
  if (data.length === 0) {
    return ""
  }

  // Extract all unique keys from responses and add fixed fields
  const allResponseKeys = new Set<string>()
  data.forEach((entry) => {
    if (entry.responses) {
      Object.keys(entry.responses).forEach((key) => allResponseKeys.add(key))
    }
  })

  const headers = [
    "Feedback ID",
    "Form ID",
    "Form Owner ID",
    "Sentiment Label",
    "Sentiment Score",
    "Created At",
    "IP Address",
    "User Agent",
    ...Array.from(allResponseKeys), // Dynamic response headers
  ]

  const rows = data.map((entry) => {
    const row: (string | number | null)[] = [
      entry.id,
      entry.formId,
      entry.userId,
      entry.sentiment?.label || "N/A",
      entry.sentiment?.score || "N/A",
      entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "N/A",
      entry.metadata?.ipAddress || "N/A",
      entry.metadata?.userAgent || "N/A",
    ]

    // Add dynamic response values
    Array.from(allResponseKeys).forEach((key) => {
      row.push(entry.responses?.[key] || "")
    })

    return row
  })

  const csvContent = [
    headers
      .map((h) => `"${h.replace(/"/g, '""')}"`)
      .join(","), // Quote headers
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")), // Quote cells
  ].join("\n")

  return csvContent
}

// Function to generate PDF from feedback data
export function generatePdf(data: FeedbackEntry[], formTitle: string): jsPDF {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(`Feedback Report: ${formTitle}`, 14, 22)

  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

  const tableColumn = [
    "ID",
    "Sentiment",
    "Score",
    "Created At",
    "IP",
    "User Agent",
    "Responses Summary", // Combined responses
  ]
  const tableRows: any[] = []

  data.forEach((entry) => {
    const responsesSummary = Object.entries(entry.responses || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")

    tableRows.push([
      entry.id,
      entry.sentiment?.label || "N/A",
      (entry.sentiment?.score * 100).toFixed(0) + "%" || "N/A",
      entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "N/A",
      entry.metadata?.ipAddress || "N/A",
      entry.metadata?.userAgent || "N/A",
      responsesSummary,
    ])
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [68, 138, 255] },
    columnStyles: {
      0: { cellWidth: 20 }, // ID
      1: { cellWidth: 20 }, // Sentiment
      2: { cellWidth: 15 }, // Score
      3: { cellWidth: 20 }, // Created At
      4: { cellWidth: 20 }, // IP
      5: { cellWidth: 25 }, // User Agent
      6: { cellWidth: "auto" }, // Responses Summary
    },
  })

  return doc
}

// Generate QR Code
export async function generateQRCode(text: string, options?: any): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      ...options,
    })
    return qrCodeDataURL
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

// Generate QR Code Data URL
export async function generateQrCodeDataURL(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, { errorCorrectionLevel: "H", width: 256 })
    return dataUrl
  } catch (err) {
    console.error("Error generating QR code:", err)
    throw new Error("Failed to generate QR code.")
  }
}

// Function to generate QR code as a data URL
export async function generateQrCode(url: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    return qrCodeDataUrl
  } catch (err) {
    console.error("Error generating QR code:", err)
    return ""
  }
}

// Generate form embed widget
export function generateEmbedWidget(
  formId: string,
  options?: { width?: string; height?: string; theme?: string },
): string {
  const { width = "100%", height = "600px", theme = "light" } = options || {}

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const embedUrl = `${baseUrl}/feedback/${formId}?embed=true&theme=${theme}`

  return `
<!-- FeedbackPro Embed Widget -->
<div id="feedbackpro-widget-${formId}" style="width: ${width}; height: ${height}; border: none; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <iframe 
    src="${embedUrl}"
    width="100%" 
    height="100%" 
    frameborder="0"
    style="border: none; border-radius: 8px;"
    title="Feedback Form"
    loading="lazy">
  </iframe>
</div>

<script>
  // Optional: Auto-resize iframe based on content
  window.addEventListener('message', function(event) {
    if (event.origin !== '${baseUrl}') return;
    
    if (event.data.type === 'feedbackpro-resize') {
      const iframe = document.querySelector('#feedbackpro-widget-${formId} iframe');
      if (iframe && event.data.height) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>

<!-- Powered by FeedbackPro -->
<p style="text-align: center; margin-top: 8px; font-size: 12px; color: #6b7280;">
  Powered by <a href="${baseUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">FeedbackPro</a>
</p>
  `.trim()
}

// Function to generate an HTML embed snippet for a form
export function generateEmbedSnippet(formId: string): string {
  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${formId}`
  return `
<iframe
  src="${formUrl}"
  width="100%"
  height="600px"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
  title="Feedback Form"
></iframe>
`
}

// Webhook payload structure
export interface WebhookPayload {
  event: string
  timestamp: string
  data: Record<string, any>
  formId?: string
  userId?: string
}

// Create webhook payload
export function createWebhookPayload(
  event: string,
  data: Record<string, any>,
  formId?: string,
  userId?: string,
): WebhookPayload {
  return {
    event,
    timestamp: new Date().toISOString(),
    data,
    formId,
    userId,
  }
}

// Send webhook
export async function sendWebhook(url: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FeedbackPro-Webhook/1.0",
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error("Webhook delivery failed:", error)
    return false
  }
}
