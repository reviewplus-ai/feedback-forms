"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Info, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'

interface CustomTemplate {
  id: string
  name: string
  description: string
  category: string
  survey_type?: 'NPS' | 'CSAT' | 'CES' | 'CUSTOM'
  language: string
  body: string
  header?: string
  footer?: string
  buttons?: any[]
  variables: string[]
  whatsapp_template_id?: string
  whatsapp_template_name?: string
  status?: string
  created_at: string
  updated_at: string
}

export default function FeedbackRequestPage() {
  const [number, setNumber] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate | null>(null)
  const [templateVars, setTemplateVars] = useState<{ [key: string]: string }>({})
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<CustomTemplate[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'UTILITY',
    survey_type: 'CUSTOM' as 'NPS' | 'CSAT' | 'CES' | 'CUSTOM',
    language: 'en',
    body: '',
    header: '',
    footer: '',
    buttons: [] as { text: string, url: string }[],
  })
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [createStatus, setCreateStatus] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Get authentication token on mount
  useEffect(() => {
    async function getAuthToken() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          // Redirect to login if no session
          router.push('/login') 
          return
        }
        setAuthToken(session.access_token)
      } catch (error) {
        console.error('Error getting auth token:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    getAuthToken()
  }, [supabase.auth, router])

  // Fetch custom templates on mount
  useEffect(() => {
    if (!authToken) return
    
    async function fetchTemplates() {
      try {
        // Fetch custom templates
        const res = await fetch('/api/whatsapp/custom-templates', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        const data = await res.json()
        if (res.ok) {
          setTemplates(data.templates)
          if (data.templates.length > 0) {
            setSelectedTemplate(data.templates[0])
          }
        } else {
          toast.error(data.error || 'Failed to fetch custom templates')
        }
      } catch (err) {
        toast.error('Failed to fetch templates')
      }
    }
    fetchTemplates()
  }, [authToken])

  // Function to refresh template statuses
  const refreshTemplateStatuses = async () => {
    if (!authToken) {
      toast.error('Authentication required')
      return
    }
    
    try {
      const res = await fetch('/api/whatsapp/templates?refresh=1', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Template statuses refreshed successfully!')
        // Refresh templates list
        const res2 = await fetch('/api/whatsapp/custom-templates', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        const data2 = await res2.json()
        if (res2.ok) {
          setTemplates(data2.templates)
          // Update selected template if it exists
          if (selectedTemplate) {
            const updatedTemplate = data2.templates.find((t: CustomTemplate) => t.id === selectedTemplate.id)
            if (updatedTemplate) {
              setSelectedTemplate(updatedTemplate)
            }
          }
        }
      } else {
        toast.error(data.error || 'Failed to refresh template statuses')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to refresh template statuses')
    }
  }

  // Function to fix templates that are missing whatsapp_template_name
  const fixTemplates = async () => {
    if (!authToken) {
      toast.error('Authentication required')
      return
    }
    
    try {
      toast.loading('Fixing templates...', { id: 'fix-templates' })
      
      const res = await fetch('/api/whatsapp/custom-templates', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        toast.success(data.message || 'Templates fixed successfully!', { id: 'fix-templates' })
        
        // Show detailed results if available
        if (data.fixed_count > 0) {
          console.log(`✅ Fixed ${data.fixed_count} templates:`, data.fixed_templates)
        }
        
        if (data.failed_templates && data.failed_templates.length > 0) {
          console.warn(`⚠️ Failed to fix ${data.failed_templates.length} templates:`, data.failed_templates)
          toast.warning(`${data.failed_templates.length} templates could not be fixed automatically. You may need to delete and recreate them.`)
        }
        
        // Refresh templates list
        const res2 = await fetch('/api/whatsapp/custom-templates', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        const data2 = await res2.json()
        if (res2.ok) {
          setTemplates(data2.templates)
          // Update selected template if it exists
          if (selectedTemplate) {
            const updatedTemplate = data2.templates.find((t: CustomTemplate) => t.id === selectedTemplate.id)
            if (updatedTemplate) {
              setSelectedTemplate(updatedTemplate)
            }
          }
        }
      } else {
        toast.error(data.error || 'Failed to fix templates', { id: 'fix-templates' })
        console.error('Template fix failed:', data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fix templates', { id: 'fix-templates' })
      console.error('Template fix error:', err)
    }
  }

  // When template changes, update variable fields
  useEffect(() => {
    if (selectedTemplate) {
      const vars: { [key: string]: string } = {}
      selectedTemplate.variables.forEach((variable, index) => {
        vars[variable] = ''
      })
      setTemplateVars(vars)
    } else {
      setTemplateVars({})
    }
  }, [selectedTemplate])

  // Handle template variable changes
  const handleTemplateVarChange = (key: string, value: string) => {
    setTemplateVars(vars => ({ ...vars, [key]: value }))
  }

  // Validation: all required variables must be filled
  const allVarsFilled = selectedTemplate ? 
    selectedTemplate.variables.every(v => templateVars[v] && templateVars[v].trim() !== '') : 
    false
  const canSend = number && selectedTemplate && allVarsFilled && !sending

  // Handle send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken) {
      toast.error('Authentication required')
      return
    }
    
    setSending(true)
    setStatus(null)
    setError(null)
    
    try {
      toast.loading('Sending WhatsApp message...', { id: 'send-message' })
      
      const payload = {
        number,
        template: selectedTemplate?.name || '',
        customTemplate: true,
        components: templateVars
      }
      
      console.log('📤 Sending WhatsApp message:', payload)
      
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        const successMsg = "Feedback request sent successfully!"
        setStatus(successMsg)
        toast.success(successMsg, { id: 'send-message' })
        
        // Clear form
        setNumber("")
        setTemplateVars({})
        
        console.log('✅ WhatsApp message sent successfully:', data)
      } else {
        const errorMsg = data.error || "Failed to send feedback request."
        setStatus(errorMsg)
        setError(errorMsg)
        toast.error(errorMsg, { id: 'send-message' })
        console.error('❌ WhatsApp message failed:', data)
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to send feedback request."
      setStatus(errorMsg)
      setError(errorMsg)
      toast.error(errorMsg, { id: 'send-message' })
      console.error('❌ WhatsApp message error:', err)
    } finally {
      setSending(false)
    }
  }

  // Handle create template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken) {
      toast.error('Authentication required')
      return
    }
    
    setCreating(true)
    setCreateStatus(null)
    
    // Validate template name: lowercase, underscores, no spaces or special chars
    const validName = /^[a-z0-9_]+$/.test(newTemplate.name)
    if (!validName) {
      setCreateStatus('Template name must be lowercase, use only letters, numbers, and underscores (no spaces or special characters).')
      setCreating(false)
      return
    }

    try {
      toast.loading('Creating WhatsApp template...', { id: 'create-template' })
      
      // Extract variables from body text
      const bodyMatches = [...newTemplate.body.matchAll(/\{\{(\w+)\}\}/g)];
      const variables = bodyMatches.map(m => m[1]);

      // Extract variables from header if present
      if (newTemplate.header) {
        const headerMatches = [...newTemplate.header.matchAll(/\{\{(\w+)\}\}/g)];
        headerMatches.forEach(m => {
          if (!variables.includes(m[1])) {
            variables.push(m[1]);
          }
        });
      }

      // Extract variables from footer if present
      if (newTemplate.footer) {
        const footerMatches = [...newTemplate.footer.matchAll(/\{\{(\w+)\}\}/g)];
        footerMatches.forEach(m => {
          if (!variables.includes(m[1])) {
            variables.push(m[1]);
          }
        });
      }

      // Extract variables from button URLs if present
      if (newTemplate.buttons && Array.isArray(newTemplate.buttons)) {
        newTemplate.buttons.forEach((btn: any) => {
          if (btn.url) {
            const urlMatches = [...btn.url.matchAll(/\{\{(\w+)\}\}/g)];
            urlMatches.forEach(m => {
              if (!variables.includes(m[1])) {
                variables.push(m[1]);
              }
            });
          }
        });
      }

      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description || '',
        category: newTemplate.category || 'UTILITY',
        survey_type: newTemplate.survey_type || 'CUSTOM',
        language: newTemplate.language || 'en',
        body: newTemplate.body,
        header: newTemplate.header || null,
        footer: newTemplate.footer || null,
        buttons: newTemplate.buttons || null,
        variables: variables,
      };

      const res = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(templateData),
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('WhatsApp template created successfully!', { id: 'create-template' })
        setCreateStatus('WhatsApp template created successfully!')
        setShowCreate(false)
        setNewTemplate({ name: '', description: '', category: 'UTILITY', survey_type: 'CUSTOM', language: 'en', body: '', header: '', footer: '', buttons: [] })
        
        // Refresh templates list
        const res2 = await fetch('/api/whatsapp/custom-templates', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        const data2 = await res2.json()
        if (res2.ok) {
          setTemplates(data2.templates)
          if (data2.templates.length > 0) {
            setSelectedTemplate(data2.templates[0])
          }
        }
        
        console.log('✅ Template created successfully:', data)
      } else {
        const errorMsg = data.error || 'Failed to create WhatsApp template.'
        toast.error(errorMsg, { id: 'create-template' })
        setCreateStatus(errorMsg)
        console.error('❌ Template creation failed:', data)
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create WhatsApp template.'
      toast.error(errorMsg, { id: 'create-template' })
      setCreateStatus(errorMsg)
      console.error('❌ Template creation error:', err)
    } finally {
      setCreating(false)
    }
  }

  // Handle edit template
  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken) {
      toast.error('Authentication required')
      return
    }
    
    if (!editingTemplate) return
    
    setUpdating(true)
    try {
      const res = await fetch('/api/whatsapp/custom-templates', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: editingTemplate.id,
          ...newTemplate
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setShowEdit(false)
        setEditingTemplate(null)
        setNewTemplate({ name: '', description: '', category: 'UTILITY', survey_type: 'CUSTOM', language: 'en', body: '', header: '', footer: '', buttons: [] })
        // Refresh templates
        const res2 = await fetch('/api/whatsapp/custom-templates', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        const data2 = await res2.json()
        if (res2.ok) {
          setTemplates(data2.templates)
          // Update selected template if it was the one being edited
          if (selectedTemplate?.id === editingTemplate.id) {
            const updatedTemplate = data2.templates.find((t: CustomTemplate) => t.id === editingTemplate.id)
            if (updatedTemplate) {
              setSelectedTemplate(updatedTemplate)
            }
          }
        }
        toast.success('Template updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update template.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update template.')
    } finally {
      setUpdating(false)
    }
  }

  // Handle delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!authToken) {
      toast.error('Authentication required')
      return
    }
    
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const res = await fetch(`/api/whatsapp/custom-templates?id=${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      if (res.ok) {
        // Refresh templates
        const res2 = await fetch('/api/whatsapp/custom-templates', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        const data2 = await res2.json()
        if (res2.ok) {
          setTemplates(data2.templates)
          if (data2.templates.length > 0) {
            setSelectedTemplate(data2.templates[0])
          } else {
            setSelectedTemplate(null)
          }
        }
        toast.success('Template deleted successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete template.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete template.')
    }
  }

  // Start editing a template
  const startEditTemplate = (template: CustomTemplate) => {
    setEditingTemplate(template)
    setNewTemplate({
      name: template.name,
      description: template.description,
      category: 'UTILITY',
      survey_type: 'CUSTOM',
      language: 'en',
      body: template.body,
      header: template.header || '',
      footer: template.footer || '',
      buttons: template.buttons || [],
    })
    setShowEdit(true)
  }

  // Build preview message
  const buildPreviewMessage = () => {
    if (!selectedTemplate) return ''
    
    let message = ''
    
    // Add header if present
    if (selectedTemplate.header) {
      message += selectedTemplate.header + '\n\n'
    }
    
    // Add body with variable replacements
    let body = selectedTemplate.body
    selectedTemplate.variables.forEach(variable => {
      const value = templateVars[variable] || `{{${variable}}}`
      body = body.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value)
    })
    message += body
    
    // Add footer if present
    if (selectedTemplate.footer) {
      message += '\n\n' + selectedTemplate.footer
    }
    
    // Add button URLs if present
    if (selectedTemplate.buttons && selectedTemplate.buttons.length > 0) {
      message += '\n\n'
      selectedTemplate.buttons.forEach((btn: any) => {
        if (btn.text && btn.url) {
          let url = btn.url
          selectedTemplate.variables.forEach(variable => {
            const value = templateVars[variable] || `{{${variable}}}`
            url = url.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value)
          })
          message += `${btn.text}: ${url}\n`
        }
      })
    }
    
    return message.trim()
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex-1 space-y-6 px-4 sm:px-4 md:px-6 pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if no auth token
  if (!authToken) {
    return (
      <div className="flex-1 space-y-6 px-4 sm:px-4 md:px-6 pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Authentication required. Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  // NEW: Search/filter state
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative min-h-screen flex flex-col gap-8 p-4 md:p-8 bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#181c24] dark:to-[#232a36]">
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 shadow-xl flex items-center justify-center text-white text-3xl hover:scale-110 active:scale-95 transition-transform border-4 border-white/30 backdrop-blur-lg"
        onClick={() => setShowCreate(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        title="Create New Template"
      >
        <Plus size={36} />
      </motion.button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Send WhatsApp Message */}
        <motion.div
          className="flex-1 max-w-xl mx-auto glass-card p-8 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-lg bg-white/60 dark:bg-[#232a36]/70"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader>
            <CardTitle>Send Feedback Request</CardTitle>
            <CardDescription>Enter customer details and send a WhatsApp feedback request.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSend}>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  WhatsApp Number
                  <span title="Enter the recipient's WhatsApp number in international format (e.g., +1234567890)"><Info size={14} /></span>
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. +1234567890"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  Message Type
                  <span title="Choose between using a template or sending a simple text message"><Info size={14} /></span>
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={true}
                      onChange={() => {}}
                    />
                    Use Template
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  Template
                  <span title="Select a custom template. Variables in the template will be replaced with your input."><Info size={14} /></span>
                </label>
                <div className="flex gap-2 items-center">
                  <select
                    className="block w-full border rounded px-2 py-1"
                    value={selectedTemplate?.id || ''}
                    onChange={e => {
                      const template = templates.find(t => t.id === e.target.value)
                      setSelectedTemplate(template || null)
                    }}
                  >
                    <option value="">Select a template</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
                    ))}
                  </select>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreate(true)}>
                    + Create Template
                  </Button>
                </div>
              </div>
              
              {selectedTemplate && Array.from(new Set(selectedTemplate.variables)).map(variable => (
                <div key={variable} className="flex items-center gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder={`{{${variable}}}`}
                    value={templateVars[variable] || ''}
                    onChange={e => handleTemplateVarChange(variable, e.target.value)}
                    required
                  />
                  <span title={`This will replace {{${variable}}} in the template.`}><Info size={14} /></span>
                </div>
              ))}
              
              <Button type="submit" className="w-full" disabled={!canSend}>
                {sending ? <span className="animate-spin mr-2">⏳</span> : null}
                {sending ? "Sending..." : "Send via WhatsApp"}
              </Button>
              {status && <p className="text-green-600 text-sm mt-2">{status}</p>}
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </form>
            
            {/* Live Preview - WhatsApp style */}
            {selectedTemplate && (
              <div className="mt-6 p-4 border rounded bg-[#e5ddd5] max-w-md mx-auto shadow-inner" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">WA</span>
                  <span className="font-semibold text-green-700">WhatsApp Preview</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm text-gray-800 whitespace-pre-line">
                    {buildPreviewMessage()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </motion.div>

        {/* Right: Template Gallery */}
        <motion.div
          className="flex-1 min-w-[340px] glass-card p-8 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-lg bg-white/60 dark:bg-[#232a36]/70"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
              <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Your WhatsApp Templates</h2>
              <p className="text-muted-foreground text-sm">Manage, edit, and preview your WhatsApp message templates.</p>
                        </div>
            <Input
              className="w-48 bg-white/70 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
                  </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <AnimatePresence>
              {filteredTemplates.length === 0 && (
                <motion.div className="col-span-2 text-center text-gray-400 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  No templates found.
                </motion.div>
              )}
              {filteredTemplates.map(template => (
                <motion.div
                  key={template.id}
                  className="relative bg-white/80 dark:bg-[#232a36]/80 rounded-2xl p-6 shadow-lg border border-white/30 flex flex-col gap-3 hover:shadow-2xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white/40">
                      <span className="sr-only">WA</span>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25D366" /><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.007-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#fff"/></svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate" title={template.name}>{template.name}</h3>
                      <p className="text-xs text-muted-foreground truncate" title={template.description}>{template.description}</p>
              </div>
                    {/* Status badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      template.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      template.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      template.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{template.status || 'UNKNOWN'}</span>
            </div>
                  <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                      className="neumorphic-btn"
                          onClick={() => startEditTemplate(template)}
                      title="Edit"
                        >
                      <Edit size={16} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                      className="neumorphic-btn"
                          onClick={() => handleDeleteTemplate(template.id)}
                      title="Delete"
                        >
                      <Trash2 size={16} />
                        </Button>
                      </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Variables: {template.variables.length > 0 ? template.variables.join(', ') : 'None'}
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>
                    </div>
        </motion.div>
      </div>

      {/* Use Dialog for modal */}
      <Dialog open={showCreate || showEdit} onOpenChange={val => { setShowCreate(false); setShowEdit(false); }}>
        <DialogContent className="bg-white/80 dark:bg-[#232a36]/90 rounded-3xl shadow-2xl border border-white/30 glass-card">
          <DialogHeader>
            <DialogTitle>
              {showEdit && editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <CreateEditTemplateForm
            isEdit={showEdit}
            template={editingTemplate}
            newTemplate={newTemplate}
            setNewTemplate={setNewTemplate}
            creating={creating}
            updating={updating}
            createStatus={createStatus}
            onSubmit={showEdit ? handleEditTemplate : handleCreateTemplate}
            onCancel={() => { setShowCreate(false); setShowEdit(false); }}
          />
        </DialogContent>
      </Dialog>

      {/* WhatsApp Preview (chat bubble style) */}
      {selectedTemplate && (
        <motion.div
          className="fixed bottom-8 left-8 z-40 max-w-xs w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-end gap-2">
            <span className="inline-block w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white/40">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25D366" /><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.007-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#fff"/></svg>
            </span>
            <div className="bg-white/90 dark:bg-[#232a36]/90 rounded-2xl p-4 shadow-xl border border-white/30 glass-card relative">
              <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                {buildPreviewMessage()}
              </div>
              </div>
              </div>
        </motion.div>
      )}

      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle>WhatsApp API Test</CardTitle>
          <CardDescription>Test your WhatsApp API connection and view existing templates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/whatsapp/templates?test=1', {
                    headers: {
                      'Authorization': `Bearer ${authToken}`
                    }
                  });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success('WhatsApp API connection successful!');
                    console.log('WhatsApp templates:', data.whatsapp_templates);
                  } else {
                    toast.error(`API test failed: ${data.error}`);
                  }
                } catch (err: any) {
                  toast.error(`Test failed: ${err.message}`);
                }
              }}
              variant="outline"
            >
              Test WhatsApp API Connection
            </Button>
            <Button 
              onClick={async () => {
                try {
                  toast.loading('Fetching WhatsApp templates...', { id: 'list-templates' });
                  const res = await fetch('/api/whatsapp/templates?list=1', {
                    headers: {
                      'Authorization': `Bearer ${authToken}`
                    }
                  });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success(`Found ${data.count} templates in WhatsApp Business account`, { id: 'list-templates' });
                    console.log('WhatsApp Business templates:', data.whatsapp_templates);
                    
                    // Show template details in console for debugging
                    if (data.whatsapp_templates && data.whatsapp_templates.length > 0) {
                      console.table(data.whatsapp_templates.map((t: any) => ({
                        name: t.name,
                        language: t.language,
                        status: t.status,
                        category: t.category
                      })));
                    }
                  } else {
                    toast.error(`Failed to fetch templates: ${data.error}`, { id: 'list-templates' });
                  }
                } catch (err: any) {
                  toast.error(`Failed to fetch templates: ${err.message}`, { id: 'list-templates' });
                }
              }}
              variant="outline"
            >
              List WhatsApp Templates
            </Button>
            <Button 
              onClick={async () => {
                try {
                  toast.loading('Syncing templates from Meta...', { id: 'sync-templates' });
                  const res = await fetch('/api/whatsapp/templates?sync=1', {
                    headers: {
                      'Authorization': `Bearer ${authToken}`
                    }
                  });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success(`Synced ${data.sync_results?.length || 0} templates from Meta`, { id: 'sync-templates' });
                    console.log('Template sync results:', data);
                    
                    // Show sync results in console
                    if (data.sync_results && data.sync_results.length > 0) {
                      console.table(data.sync_results.map((r: any) => ({
                        name: r.name,
                        status: r.status,
                        meta_status: r.meta_status || 'N/A',
                        error: r.error || 'None'
                      })));
                    }
                    
                    // Refresh templates list
                    const res2 = await fetch('/api/whatsapp/custom-templates', {
                      headers: {
                        'Authorization': `Bearer ${authToken}`
                      }
                    });
                    const data2 = await res2.json();
                    if (res2.ok) {
                      setTemplates(data2.templates);
                      if (selectedTemplate) {
                        const updatedTemplate = data2.templates.find((t: CustomTemplate) => t.id === selectedTemplate.id);
                        if (updatedTemplate) {
                          setSelectedTemplate(updatedTemplate);
                        }
                      }
                    }
                  } else {
                    toast.error(`Failed to sync templates: ${data.error}`, { id: 'sync-templates' });
                  }
                } catch (err: any) {
                  toast.error(`Failed to sync templates: ${err.message}`, { id: 'sync-templates' });
                }
              }}
              variant="outline"
            >
              Sync from Meta
            </Button>
            <p className="text-sm text-muted-foreground">
              Click this button to test if your WhatsApp API credentials are working correctly.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Troubleshooting Template Issues</CardTitle>
          <CardDescription>Common issues and how to fix them.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-800 mb-2">Error: "Template name does not exist in the translation"</h4>
              <p className="text-sm text-red-700 mb-2">
                This error occurs when a template is missing the <code>whatsapp_template_name</code> field or the template doesn't exist in your WhatsApp Business account.
              </p>
              <div className="space-y-2 text-sm text-red-700">
                <p><strong>Solution:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the "Fix Templates" button above to automatically fix templates missing the WhatsApp template name</li>
                  <li>Click the "Sync from Meta" button in the API Test section to sync your templates with WhatsApp Business API</li>
                  <li>If that doesn't work, delete the problematic template and create a new one</li>
                  <li>Make sure your WhatsApp API credentials are correctly set in your environment variables</li>
                  <li>Verify that your WhatsApp Business account has the necessary permissions</li>
                </ol>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">Template Status Issues</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <p><strong>PENDING:</strong> Template is waiting for WhatsApp approval. This can take 24-48 hours.</p>
                <p><strong>REJECTED:</strong> Template was rejected by WhatsApp. Check the content and try again with different wording.</p>
                <p><strong>APPROVED:</strong> Template is ready to use for sending messages.</p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Best Practices</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>Always use UTILITY category for business-related templates</li>
                <li>Include specific, actionable information in your templates</li>
                <li>Avoid promotional language or casual greetings</li>
                <li>Test templates with small groups before sending to all customers</li>
                <li>Keep template names simple and descriptive</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle>How WhatsApp Templates Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Create official WhatsApp templates that are sent as template messages (not text messages).</li>
            <li>Templates are created via Meta's Graph API and stored in your WhatsApp Business account.</li>
            <li>Template messages can be sent and received, unlike regular text messages which have restrictions.</li>
            <li>Variables like <code>{"{{customer_name}}"}</code> are automatically detected and replaced when sending.</li>
            <li>Templates support headers, body text, footers, and URL buttons.</li>
            <li>All templates are properly formatted and approved by WhatsApp for business use.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Creating UTILITY Templates (Approval Guidelines)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Why Templates Get Rejected as Marketing:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>Content that promotes products, services, or sales</li>
                <li>Generic greetings or casual conversation</li>
                <li>Content that doesn't clearly serve a business utility purpose</li>
                <li>Text that could be interpreted as promotional</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-800 mb-2">UTILITY Template Examples (More Likely to be Approved):</h4>
              <div className="space-y-3 text-sm text-green-700">
                <div>
                  <strong>Appointment Reminder:</strong><br/>
                  <code>Header: "Appointment Reminder"<br/>
                  Body: "Hi {"{{customer_name}}"}, this is a reminder for your appointment on {"{{date}}"} at {"{{time}}"}. Please confirm by replying YES or NO."<br/>
                  Footer: "Reply STOP to unsubscribe"</code>
                </div>
                <div>
                  <strong>Order Status Update:</strong><br/>
                  <code>Header: "Order Update"<br/>
                  Body: "Your order #{"{{order_number}}"} has been {"{{status}}"}. Expected delivery: {"{{delivery_date}}"}. Track your order: {"{{tracking_url}}"}."<br/>
                  Footer: "Contact us if you have questions"</code>
                </div>
                <div>
                  <strong>Account Verification:</strong><br/>
                  <code>Header: "Security Alert"<br/>
                  Body: "We detected a login attempt for your account. If this was you, please verify with code: {"{{verification_code}}"}. If not, contact support immediately."<br/>
                  Footer: "This code expires in 10 minutes"</code>
                </div>
                <div>
                  <strong>Service Notification:</strong><br/>
                  <code>Header: "Service Update"<br/>
                  Body: "Your {"{{service_name}}"} service has been {"{{status}}"}. Next scheduled maintenance: {"{{maintenance_date}}"}. Contact: {"{{support_phone}}"}."<br/>
                  Footer: "Thank you for choosing our service"</code>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">Best Practices for UTILITY Templates:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                <li><strong>Be specific:</strong> Include clear business purpose (appointments, orders, security, etc.)</li>
                <li><strong>Include actionable information:</strong> Dates, times, order numbers, verification codes</li>
                <li><strong>Use professional language:</strong> Avoid casual greetings or promotional language</li>
                <li><strong>Include contact information:</strong> Phone numbers, support emails, or tracking URLs</li>
                <li><strong>Add opt-out instructions:</strong> "Reply STOP to unsubscribe" in footer</li>
                <li><strong>Focus on customer service:</strong> Notifications, updates, confirmations, alerts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Automation Triggers</CardTitle>
          <CardDescription>Test automated survey triggers for different events.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutomationTestSection authToken={authToken} />
        </CardContent>
      </Card>
    </div>
  )
}

// Automation Test Component
function AutomationTestSection({ authToken }: { authToken: string | null }) {
  const [triggers, setTriggers] = useState<any[]>([])
  const [selectedTrigger, setSelectedTrigger] = useState('')
  const [testNumber, setTestNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [testing, setTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!authToken) return
    
    async function fetchTriggers() {
      try {
        const res = await fetch('/api/whatsapp/automation', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        const data = await res.json()
        if (res.ok) {
          setTriggers(data.triggers)
        }
      } catch (err) {
        console.error('Failed to fetch triggers')
      }
    }
    fetchTriggers()
  }, [authToken])

  const handleTestTrigger = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken) {
      toast.error('Authentication required')
      return
    }
    
    if (!selectedTrigger || !testNumber) return

    setTesting(true)
    setTestStatus(null)

    try {
      const res = await fetch('/api/whatsapp/automation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          trigger: selectedTrigger,
          number: testNumber,
          customer_name: customerName || 'Test Customer',
          variables: {}
        })
      })

      const data = await res.json()
      if (res.ok) {
        setTestStatus('Automated survey sent successfully!')
        toast.success('Automated survey sent!')
        setTestNumber('')
        setCustomerName('')
      } else {
        setTestStatus(data.error || 'Failed to send automated survey')
        toast.error(data.error || 'Failed to send automated survey')
      }
    } catch (err: any) {
      setTestStatus(err.message || 'Failed to send automated survey')
      toast.error(err.message || 'Failed to send automated survey')
    } finally {
      setTesting(false)
    }
  }

  if (triggers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No automation triggers configured yet. Create templates with automation triggers to test them here.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleTestTrigger} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Select Trigger</label>
          <select
            className="block w-full border rounded px-2 py-1"
            value={selectedTrigger}
            onChange={e => setSelectedTrigger(e.target.value)}
            required
          >
            <option value="">Choose a trigger</option>
            {triggers.map(trigger => (
              <option key={trigger.trigger} value={trigger.trigger}>
                {trigger.trigger} - {trigger.template_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Test Phone Number</label>
          <Input
            type="tel"
            placeholder="+1234567890"
            value={testNumber}
            onChange={e => setTestNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Customer Name (Optional)</label>
          <Input
            type="text"
            placeholder="John Doe"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={testing || !selectedTrigger || !testNumber}>
          {testing ? 'Sending...' : 'Test Automation Trigger'}
        </Button>
      </form>
      {testStatus && (
        <p className={`text-sm ${testStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {testStatus}
        </p>
      )}
    </div>
  )
} 

// Extract CreateEditTemplateForm as a separate component
function CreateEditTemplateForm({
  isEdit,
  template,
  newTemplate,
  setNewTemplate,
  creating,
  updating,
  createStatus,
  onSubmit,
  onCancel
}: {
  isEdit: boolean,
  template: any,
  newTemplate: any,
  setNewTemplate: any,
  creating: boolean,
  updating: boolean,
  createStatus: string | null,
  onSubmit: (e: React.FormEvent) => void,
  onCancel: () => void
}) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input 
          value={newTemplate.name} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, name: e.target.value }))} 
          placeholder="e.g., feedback_request"
          required 
        />
        <p className="text-xs text-muted-foreground mt-1">Use lowercase, letters, numbers, and underscores only</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select 
          className="block w-full border rounded px-2 py-1" 
          value={newTemplate.category} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, category: e.target.value }))}
        >
          <option value="UTILITY">UTILITY</option>
          <option value="MARKETING">MARKETING</option>
          <option value="AUTHENTICATION">AUTHENTICATION</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">Choose the appropriate category for your template</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Survey Type</label>
        <select 
          className="block w-full border rounded px-2 py-1" 
          value={newTemplate.survey_type} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, survey_type: e.target.value }))}
        >
          <option value="CUSTOM">Custom Survey</option>
          <option value="NPS">Net Promoter Score (NPS)</option>
          <option value="CSAT">Customer Satisfaction (CSAT)</option>
          <option value="CES">Customer Effort Score (CES)</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">Choose the type of survey you want to create</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Language</label>
        <select 
          className="block w-full border rounded px-2 py-1" 
          value={newTemplate.language} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, language: e.target.value }))}
        >
          <option value="en">English (US)</option>
          <option value="es">Spanish (ES)</option>
          <option value="fr">French (FR)</option>
          <option value="de">German (DE)</option>
          <option value="ar">Arabic (AR)</option>
          <option value="pt">Portuguese (BR)</option>
          <option value="it">Italian (IT)</option>
          <option value="ja">Japanese (JP)</option>
          <option value="ko">Korean (KR)</option>
          <option value="zh">Chinese (CN)</option>
          <option value="ru">Russian (RU)</option>
          <option value="tr">Turkish (TR)</option>
          <option value="nl">Dutch (NL)</option>
          <option value="pl">Polish (PL)</option>
          <option value="th">Thai (TH)</option>
          <option value="vi">Vietnamese (VN)</option>
          <option value="id">Indonesian (ID)</option>
          <option value="ms">Malay (MY)</option>
          <option value="tl">Filipino (PH)</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">Select a language supported by WhatsApp Business API</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input 
          value={newTemplate.description} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, description: e.target.value }))} 
          placeholder="Brief description of this template"
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Body</label>
        <Textarea 
          value={newTemplate.body} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, body: e.target.value }))} 
          placeholder="Your message body. Use {{variable_name}} for variables."
          required 
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Header (optional)</label>
        <Input 
          value={newTemplate.header} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, header: e.target.value }))} 
          placeholder="Header text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Footer (optional)</label>
        <Input 
          value={newTemplate.footer} 
          onChange={e => setNewTemplate((t: any) => ({ ...t, footer: e.target.value }))} 
          placeholder="Footer text"
        />
      </div>
      {/* URL Buttons */}
      <div>
        <label className="block text-sm font-medium mb-1">URL Buttons (optional)</label>
        {newTemplate.buttons.map((btn: any, idx: number) => (
          <div key={idx} className="flex gap-2 items-center mb-2">
            <Input
              className="w-1/3"
              placeholder="Button Text"
              value={btn.text}
              onChange={e => setNewTemplate((t: any) => {
                const buttons = [...t.buttons]
                buttons[idx].text = e.target.value
                return { ...t, buttons }
              })}
            />
            <Input
              className="w-2/3"
              placeholder="Button URL (can use {{variable}})"
              value={btn.url}
              onChange={e => setNewTemplate((t: any) => {
                const buttons = [...t.buttons]
                buttons[idx].url = e.target.value
                return { ...t, buttons }
              })}
            />
            <Button type="button" size="icon" variant="ghost" onClick={() => setNewTemplate((t: any) => ({ ...t, buttons: t.buttons.filter((_: any, i: number) => i !== idx) }))}>
              ×
            </Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="secondary" className="mt-1" onClick={() => setNewTemplate((t: any) => ({ ...t, buttons: [...t.buttons, { text: '', url: '' }] }))}>
          + Add URL Button
        </Button>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={isEdit ? updating : creating}>
          {isEdit ? (updating ? 'Updating...' : 'Update') : (creating ? 'Creating...' : 'Create')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
      {createStatus && <div className="text-sm mt-2 text-green-600">{createStatus}</div>}
    </form>
  )
} 