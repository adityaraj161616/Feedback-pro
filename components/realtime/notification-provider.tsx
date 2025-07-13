"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import SocketManager from "@/lib/socket"
import { toast } from "sonner"
import type { Socket } from "socket.io-client"

interface NotificationContextType {
  socket: Socket | null
  notifications: Notification[]
  markAsRead: (id: string) => void
}

interface Notification {
  id: string
  type: "feedback" | "form_created" | "user_joined"
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      const socketManager = SocketManager.getInstance()
      const socketInstance = socketManager.connect(session.user.id)
      setSocket(socketInstance)

      // Listen for real-time notifications
      socketInstance.on("new_feedback", (data) => {
        const notification: Notification = {
          id: `feedback_${Date.now()}`,
          type: "feedback",
          title: "New Feedback Received",
          message: `New feedback on "${data.formTitle}"`,
          timestamp: new Date(),
          read: false,
          data,
        }

        setNotifications((prev) => [notification, ...prev])

        // Show toast notification
        toast.success("New feedback received!", {
          description: `From form: ${data.formTitle}`,
          action: {
            label: "View",
            onClick: () => window.open(`/dashboard/feedback/${data.feedbackId}`, "_blank"),
          },
        })
      })

      socketInstance.on("form_response", (data) => {
        const notification: Notification = {
          id: `response_${Date.now()}`,
          type: "feedback",
          title: "Form Response",
          message: `Someone responded to "${data.formTitle}"`,
          timestamp: new Date(),
          read: false,
          data,
        }

        setNotifications((prev) => [notification, ...prev])
      })

      return () => {
        socketManager.disconnect()
      }
    }
  }, [session])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  return (
    <NotificationContext.Provider value={{ socket, notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
