import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'

interface ReviewStatusSelectProps {
  reviewId: string
  currentStatus: string | null
  onStatusChange: (newStatus: string) => void
}

export default function ReviewStatusSelect({ reviewId, currentStatus, onStatusChange }: ReviewStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [localStatus, setLocalStatus] = useState(currentStatus || 'pending')

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return // Don't update if status hasn't changed

    // Debug log
    console.log('Review ID:', reviewId, 'Current Status:', currentStatus, 'New Status:', newStatus)

    try {
      setIsUpdating(true)
      setLocalStatus(newStatus) // Optimistically update UI

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        })
        throw new Error(errorData.error || `Failed to update status (${response.status})`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      // Only update parent if Supabase update was successful
      onStatusChange(newStatus)
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', {
        error,
        reviewId,
        currentStatus,
        attemptedStatus: newStatus,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      // Revert to previous status on error
      setLocalStatus(currentStatus || 'pending')
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'contacted':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Select
      value={localStatus}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={`w-[140px] ${getStatusColor(localStatus)}`}>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="contacted">Contacted</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )
} 