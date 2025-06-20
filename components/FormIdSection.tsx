'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FormIdSectionProps {
  formId: string
}

export function FormIdSection({ formId }: FormIdSectionProps) {
  return (
    <div className="border rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Form ID</h2>
      <div className="flex items-center gap-4">
        <code className="bg-gray-100 px-4 py-2 rounded-md font-mono text-sm">{formId}</code>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(formId);
            toast.success('Form ID copied to clipboard');
          }}
        >
          Copy ID
        </Button>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Use this ID to subscribe to form notifications in the Telegram bot with the command: <code>/subscribe {formId}</code>
      </p>
      <Button
        asChild
        variant="secondary"
        className="mt-4"
      >
        <a
          href={`https://t.me/reviewnotify_bot?start=subscribe_${formId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Telegram Bot & Subscribe
        </a>
      </Button>
    </div>
  )
} 