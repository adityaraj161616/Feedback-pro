import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { isValidURL } from "@/lib/security"
import clientPromise from "@/lib/mongodb"
import { logAudit } from "@/lib/audit"
import { sendWebhook } from "@/lib/export"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId, webhookUrl, events } = await request.json()

    // Validate webhook URL
    if (!isValidURL(webhookUrl)) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const forms = db.collection("forms")

    // Verify form ownership
    const form = await forms.findOne({ id: formId, userId: session.user.id })
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Add webhook to form
    const webhook = {
      id: `webhook_${Date.now()}`,
      url: webhookUrl,
      events: events || ["feedback.created"],
      createdAt: new Date(),
      isActive: true,
    }

    await forms.updateOne({ id: formId }, { $push: { webhooks: webhook } })

    return NextResponse.json({ success: true, webhook })
  } catch (error) {
    console.error("Webhook creation error:", error)
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("formId")
    const webhookId = searchParams.get("webhookId")

    if (!formId || !webhookId) {
      return NextResponse.json({ error: "Form ID and Webhook ID required" }, { status: 400 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const forms = db.collection("forms")

    // Remove webhook from form
    await forms.updateOne({ id: formId, userId: session.user.id }, { $pull: { webhooks: { id: webhookId } } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook deletion error:", error)
    return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 })
  }
}

export async function TRIGGER(request: NextRequest) {
  try {
    const { event, data, webhookUrl } = await request.json()

    if (!event || !data || !webhookUrl) {
      await logAudit({
        action: "Webhook Trigger Failed",
        details: { reason: "Missing event, data, or webhookUrl", body: { event, data, webhookUrl }, ip: request.ip },
      })
      return NextResponse.json({ error: "Missing event, data, or webhookUrl" }, { status: 400 })
    }

    // In a real application, you would fetch the webhook configuration from your DB
    // and verify the webhookUrl against registered webhooks for security.
    // For this example, we'll assume the provided webhookUrl is valid.

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any necessary authorization headers for the webhook here
        // 'Authorization': 'Bearer YOUR_WEBHOOK_SECRET'
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      await logAudit({
        action: "Webhook Triggered Successfully",
        details: { event, webhookUrl, status: response.status, ip: request.ip },
      })
      return NextResponse.json({ message: "Webhook triggered successfully" })
    } else {
      const errorText = await response.text()
      await logAudit({
        action: "Webhook Trigger Failed",
        details: { event, webhookUrl, status: response.status, error: errorText, ip: request.ip },
      })
      return NextResponse.json(
        { error: `Failed to trigger webhook: ${response.status} - ${errorText}` },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error triggering webhook:", error)
    await logAudit({
      action: "Webhook Trigger Failed",
      details: { error: error.message, ip: request.ip, body: await request.json().catch(() => {}) },
    })
    return NextResponse.json({ error: "Failed to trigger webhook" }, { status: 500 })
  }
}

export async function SEND(request: NextRequest) {
  try {
    const { url, payload } = await request.json()

    if (!url || !payload) {
      return NextResponse.json({ error: "Missing URL or payload" }, { status: 400 })
    }

    // In a real application, you'd want to validate the user's authorization
    // to send webhooks and ensure the URL is safe.

    await sendWebhook(url, payload)

    await logAudit({
      action: "Webhook Sent",
      details: { url, eventType: payload.eventType },
      severity: "low",
    })

    return NextResponse.json({ success: true, message: "Webhook sent successfully" })
  } catch (error) {
    console.error("Error sending webhook via API:", error)
    await logAudit({
      action: "Webhook Send Failed",
      details: {
        error: error.message,
        url: request
          .json()
          .then((b) => b.url)
          .catch(() => "N/A"),
      },
      severity: "high",
    })
    return NextResponse.json({ error: "Failed to send webhook" }, { status: 500 })
  }
}
