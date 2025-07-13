"use client"

import { Toaster } from "sonner"
import { useEffect } from "react"
import { gsap } from "gsap"

export function ToastProvider() {
  useEffect(() => {
    // GSAP animation for toasts (example: fade in and slide up)
    // This targets the default Sonner toast elements
    const animateToast = () => {
      gsap.fromTo(
        ".sonner-toast",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
      )
    }

    // Observe the DOM for new toast elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.classList.contains("sonner-toast")) {
              animateToast()
            }
          })
        }
      })
    })

    // Start observing the body for changes
    observer.observe(document.body, { childList: true, subtree: true })

    // Cleanup observer on component unmount
    return () => observer.disconnect()
  }, [])

  return (
    <Toaster
      position="bottom-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700 shadow-lg",
          title: "text-lg font-semibold",
          description: "text-gray-300",
          actionButton: "bg-blue-600 hover:bg-blue-700 text-white",
          cancelButton: "bg-gray-600 hover:bg-gray-700 text-white",
          closeButton: "text-gray-400 hover:text-white",
        },
      }}
    />
  )
}
