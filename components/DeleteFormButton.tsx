'use client'

import { Button } from '@/components/ui/button'
import { deleteForm } from '@/app/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteFormButtonProps {
  formId: string
}

export function DeleteFormButton({ formId }: DeleteFormButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      const formData = new FormData()
      formData.append('formId', formId)
      
      // Perform the delete operation first
      await deleteForm(formData)
      
      // Show success message
      toast.success('Form deleted successfully')
      
      // Use replace instead of push to prevent back navigation to deleted form
      router.replace('/dashboard/forms')
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error('Failed to delete form. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
} 