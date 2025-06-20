"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Info } from 'lucide-react'
import { toast } from 'sonner'

// Dummy data for recent requests (replace with real API data)
const dummyRequests = [
  { id: 1, number: "+1234567890", name: "John Doe", status: "Sent", date: "2024-05-01" },
  { id: 2, number: "+1987654321", name: "Jane Smith", status: "Delivered", date: "2024-05-02" },
]

export default function FeedbackRequestPage() {
  const [number, setNumber] = useState("")
  const [template, setTemplate] = useState('')
  const [language, setLanguage] = useState('en_US')
  const [templateVars, setTemplateVars] = useState<{ [key: string]: string }>({})
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en_US',
    body: '',
    header: '',
    footer: '',
    buttons: [] as { type: string, text: string, url?: string }[],
  })
  const [creating, setCreating] = useState(false)
  const [createStatus, setCreateStatus] = useState<string | null>(null)

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      const res = await fetch('/api/whatsapp/templates')
      const data = await res.json()
      if (res.ok) {
        setTemplates(data.templates)
        if (data.templates.length > 0) {
          setTemplate(data.templates[0].name)
        }
      }
    }
    fetchTemplates()
  }, [])

  // When template changes, update selectedTemplate and variable fields
  useEffect(() => {
    const t = templates.find(t => t.name === template)
    setSelectedTemplate(t || null)
    // Set up variable fields for the body and button URL variables
    if (t && t.components) {
      const body = t.components.find((c: any) => c.type === 'BODY')
      const buttons = t.components.find((c: any) => c.type === 'BUTTONS')
      const vars: { [key: string]: string } = {}
      // Body variables
      if (body && body.text) {
        const matches = [...body.text.matchAll(/\{\{(\w+)\}\}/g)]
        matches.forEach((m, i) => { vars[`body_var${i+1}`] = '' })
      }
      // Button URL variables ONLY if the button URL has variables
      if (buttons && Array.isArray(buttons.buttons)) {
        buttons.buttons.forEach((btn: any, btnIdx: number) => {
          if (btn.type === 'URL' && typeof btn.url === 'string') {
            const urlMatches = [...btn.url.matchAll(/\{\{(\w+)\}\}/g)]
            if (urlMatches.length > 0) {
              urlMatches.forEach((m, j) => {
                vars[`button_var_${btnIdx}_${j+1}`] = ''
              })
            }
          }
        })
      }
      setTemplateVars(vars)
    } else {
      setTemplateVars({})
    }
  }, [template, templates])

  // Handle template variable changes
  const handleTemplateVarChange = (key: string, value: string) => {
    setTemplateVars(vars => ({ ...vars, [key]: value }))
  }

  // Helper: get required variable keys for validation
  const requiredVarKeys = (() => {
    if (!selectedTemplate || !selectedTemplate.components) return []
    const body = selectedTemplate.components.find((c: any) => c.type === 'BODY')
    const buttons = selectedTemplate.components.find((c: any) => c.type === 'BUTTONS')
    const keys: string[] = []
    if (body && body.text) {
      const matches = [...body.text.matchAll(/\{\{(\w+)\}\}/g)]
      matches.forEach((m, i) => keys.push(`body_var${i+1}`))
    }
    if (buttons && Array.isArray(buttons.buttons)) {
      buttons.buttons.forEach((btn: any, btnIdx: number) => {
        if (btn.type === 'URL' && typeof btn.url === 'string') {
          const urlMatches = [...btn.url.matchAll(/\{\{(\w+)\}\}/g)]
          if (urlMatches.length > 0) {
            urlMatches.forEach((m, j) => keys.push(`button_var_${btnIdx}_${j+1}`))
          }
        }
      })
    }
    return keys
  })()
  // Validation: all required fields must be filled
  const allVarsFilled = requiredVarKeys.every(k => templateVars[k] && templateVars[k].trim() !== '')
  const canSend = number && template && language && allVarsFilled && !sending

  // Handle send (with toast feedback)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    setError(null)
    try {
      let payload: any = { number, template, language }
      const components: any[] = []
      if (selectedTemplate) {
        const body = selectedTemplate.components?.find((c: any) => c.type === 'BODY')
        if (body && body.text) {
          const matches = [...body.text.matchAll(/\{\{(\w+)\}\}/g)]
          if (matches.length > 0) {
            components.push({
              type: 'body',
              parameters: matches.map((m, i) => ({ type: 'text', text: templateVars[`body_var${i+1}`] || '' }))
            })
          }
        }
        const buttons = selectedTemplate.components?.find((c: any) => c.type === 'BUTTONS')
        if (buttons && Array.isArray(buttons.buttons)) {
          buttons.buttons.forEach((btn: any, btnIdx: number) => {
            if (btn.type === 'URL' && typeof btn.url === 'string') {
              const urlMatches = [...btn.url.matchAll(/\{\{(\w+)\}\}/g)]
              if (urlMatches.length > 0) {
                const buttonParams = urlMatches.map((m, j) => ({
                  type: 'text',
                  text: templateVars[`button_var_${btnIdx}_${j+1}`] || ''
                }))
                components.push({
                  type: 'button',
                  sub_type: 'url',
                  index: String(btnIdx),
                  parameters: buttonParams
                })
              }
            }
          })
        }
      }
      if (components.length > 0) {
        payload.components = components
      }
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("Feedback request sent!")
        toast.success('Feedback request sent successfully!')
      } else {
        setStatus(data.error || "Failed to send feedback request.")
        setError(data.error || "Failed to send feedback request.")
        toast.error(data.error || "Failed to send feedback request.")
      }
    } catch (err: any) {
      setStatus("Failed to send feedback request.")
      setError(err.message || "Failed to send feedback request.")
      toast.error(err.message || "Failed to send feedback request.")
    } finally {
      setSending(false)
    }
  }

  // Handle create template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
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
      const body: any = {
        name: newTemplate.name,
        category: newTemplate.category,
        language: newTemplate.language,
        components: [
          { type: 'BODY', text: newTemplate.body },
        ]
      }
      if (newTemplate.header) body.components.push({ type: 'HEADER', format: 'TEXT', text: newTemplate.header })
      if (newTemplate.footer) body.components.push({ type: 'FOOTER', text: newTemplate.footer })
      // Add URL buttons if present
      if (newTemplate.buttons.length > 0) {
        body.components.push({
          type: 'BUTTONS',
          buttons: newTemplate.buttons.map(btn => ({
            type: 'URL',
            text: btn.text,
            url: btn.url
          }))
        })
      }
      const res = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setCreateStatus('Template created! It may take a few minutes to be approved.')
        setShowCreate(false)
        setNewTemplate({ name: '', category: 'UTILITY', language: 'en_US', body: '', header: '', footer: '', buttons: [] })
        // Refresh templates
        const res2 = await fetch('/api/whatsapp/templates')
        const data2 = await res2.json()
        if (res2.ok) setTemplates(data2.templates)
      } else {
        setCreateStatus(data.error || 'Failed to create template.')
      }
    } catch (err: any) {
      setCreateStatus(err.message || 'Failed to create template.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 px-4 sm:px-4 md:px-6 pb-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mt-2 mb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
            Feedback Request via WhatsApp
            <span title="Send WhatsApp feedback requests using approved templates. Only required variables will be shown." className="ml-1 cursor-pointer"><Info size={18} /></span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1">
            Send personalized feedback requests to your customers directly on WhatsApp for higher engagement.
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1 border-none shadow-sm hover:shadow-md transition-shadow">
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
                  Template
                  <span title="Select an approved WhatsApp template. Only templates with required variables will prompt for input."><Info size={14} /></span>
                </label>
                <div className="flex gap-2 items-center">
                  <select
                    className="block w-full border rounded px-2 py-1"
                    value={template}
                    onChange={e => setTemplate(e.target.value)}
                  >
                    {templates.map(t => (
                      <option key={t.name} value={t.name}>{t.name} ({t.language})</option>
                    ))}
                  </select>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreate(true)}>
                    + Create Template
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  Language Code
                  <span title="WhatsApp template language code, e.g., en_US, hi_IN, etc."><Info size={14} /></span>
                </label>
                <Input
                  type="text"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  required
                />
              </div>
              {selectedTemplate && (Object.keys(templateVars).length > 0) && (
                <div>
                  <label className="block text-sm font-medium mb-1">Template Variables</label>
                  {/* Body variables */}
                  {selectedTemplate.components?.find((c: any) => c.type === 'BODY') &&
                    (() => {
                      const body = selectedTemplate.components.find((c: any) => c.type === 'BODY')
                      const matches = body && body.text ? [...body.text.matchAll(/\{\{(\w+)\}\}/g)] : []
                      return matches.map((m, i) => (
                        <div key={`body_var${i+1}`} className="flex items-center gap-2 mb-2">
                          <Input
                            type="text"
                            placeholder={`Body Variable {{${m[1]}}}`}
                            value={templateVars[`body_var${i+1}`] || ''}
                            onChange={e => handleTemplateVarChange(`body_var${i+1}`, e.target.value)}
                            required
                          />
                          <span title={`This will replace {{${m[1]}}} in the template.`}><Info size={14} /></span>
                        </div>
                      ))
                    })()
                  }
                  {/* Button URL variable fields ONLY if the button URL has variables */}
                  {selectedTemplate.components?.find((c: any) => c.type === 'BUTTONS') &&
                    (() => {
                      const buttons = selectedTemplate.components.find((c: any) => c.type === 'BUTTONS')
                      if (!buttons || !Array.isArray(buttons.buttons)) return null
                      return buttons.buttons.map((btn: any, btnIdx: number) => {
                        if (btn.type === 'URL' && typeof btn.url === 'string') {
                          const urlMatches = [...btn.url.matchAll(/\{\{(\w+)\}\}/g)]
                          if (urlMatches.length > 0) {
                            return urlMatches.map((m, j) => (
                              <div key={`button_var_${btnIdx}_${j+1}`} className="flex items-center gap-2 mb-2">
                                <Input
                                  type="text"
                                  placeholder={`Button: ${btn.text} URL Variable {{${m[1]}}}`}
                                  value={templateVars[`button_var_${btnIdx}_${j+1}`] || ''}
                                  onChange={e => handleTemplateVarChange(`button_var_${btnIdx}_${j+1}`, e.target.value)}
                                  required
                                />
                                <span title={`This will replace {{${m[1]}}} in the button URL.`}><Info size={14} /></span>
                              </div>
                            ))
                          }
                        }
                        return null
                      })
                    })()
                  }
                </div>
              )}
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
                <div className="bg-white rounded-lg p-3 shadow-sm" style={{ position: 'relative' }}>
                  <div className="text-sm text-gray-800 whitespace-pre-line">
                    {(() => {
                      let preview = ''
                      const body = selectedTemplate.components?.find((c: any) => c.type === 'BODY')
                      if (body && body.text) {
                        preview = body.text
                        const matches = [...body.text.matchAll(/\{\{(\w+)\}\}/g)]
                        matches.forEach((m, i) => {
                          preview = preview.replace(`{{${m[1]}}}`, templateVars[`body_var${i+1}`] || `{{${m[1]}}}`)
                        })
                      } else {
                        preview = '[No body text]'
                      }
                      return preview
                    })()}
                  </div>
                  {/* Optionally show header/footer/buttons */}
                  <div className="mt-2">
                    {(() => {
                      const header = selectedTemplate.components?.find((c: any) => c.type === 'HEADER')
                      if (header && header.text) {
                        return <div className="mb-2 font-bold text-green-700">{header.text}</div>
                      }
                      return null
                    })()}
                    {(() => {
                      const footer = selectedTemplate.components?.find((c: any) => c.type === 'FOOTER')
                      if (footer && footer.text) {
                        return <div className="mt-2 text-xs text-gray-500">{footer.text}</div>
                      }
                      return null
                    })()}
                    {(() => {
                      const buttons = selectedTemplate.components?.find((c: any) => c.type === 'BUTTONS')
                      if (buttons && Array.isArray(buttons.buttons)) {
                        return (
                          <div className="mt-4 flex gap-2">
                            {buttons.buttons.map((btn: any, i: number) => (
                              <button key={i} className="inline-block px-4 py-2 rounded bg-green-600 text-white text-xs font-semibold shadow hover:bg-green-700 transition">
                                {btn.text}
                              </button>
                            ))}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
              </div>
            )}
            {/* Create Template Modal */}
            {showCreate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4">Create New Template</h3>
                  <form className="space-y-3" onSubmit={handleCreateTemplate}>
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <Input value={newTemplate.name} onChange={e => setNewTemplate(t => ({ ...t, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select className="block w-full border rounded px-2 py-1" value={newTemplate.category} onChange={e => setNewTemplate(t => ({ ...t, category: e.target.value }))}>
                        <option value="UTILITY">UTILITY</option>
                        <option value="MARKETING">MARKETING</option>
                        <option value="AUTHENTICATION">AUTHENTICATION</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Language</label>
                      <Input value={newTemplate.language} onChange={e => setNewTemplate(t => ({ ...t, language: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Body</label>
                      <Textarea value={newTemplate.body} onChange={e => setNewTemplate(t => ({ ...t, body: e.target.value }))} required rows={3} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Header (optional)</label>
                      <Input value={newTemplate.header} onChange={e => setNewTemplate(t => ({ ...t, header: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Footer (optional)</label>
                      <Input value={newTemplate.footer} onChange={e => setNewTemplate(t => ({ ...t, footer: e.target.value }))} />
                    </div>
                    {/* URL Buttons */}
                    <div>
                      <label className="block text-sm font-medium mb-1">URL Buttons (optional)</label>
                      {newTemplate.buttons.map((btn, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <Input
                            className="w-1/3"
                            placeholder="Button Text"
                            value={btn.text}
                            onChange={e => setNewTemplate(t => {
                              const buttons = [...t.buttons]
                              buttons[idx].text = e.target.value
                              return { ...t, buttons }
                            })}
                            required
                          />
                          <Input
                            className="w-2/3"
                            placeholder="Button URL (can use {{1}})"
                            value={btn.url || ''}
                            onChange={e => setNewTemplate(t => {
                              const buttons = [...t.buttons]
                              buttons[idx].url = e.target.value
                              return { ...t, buttons }
                            })}
                            required
                          />
                          <Button type="button" size="icon" variant="ghost" onClick={() => setNewTemplate(t => ({ ...t, buttons: t.buttons.filter((_, i) => i !== idx) }))}>
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="secondary" className="mt-1" onClick={() => setNewTemplate(t => ({ ...t, buttons: [...t.buttons, { type: 'URL', text: '', url: '' }] }))}>
                        + Add URL Button
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
                      <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                    </div>
                    {createStatus && <div className="text-sm mt-2 text-green-600">{createStatus}</div>}
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent WhatsApp Feedback Requests</CardTitle>
            <CardDescription>Track the status of your recent feedback requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2">Number</th>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyRequests.map(req => (
                    <tr key={req.id}>
                      <td className="py-2 px-2">{req.number}</td>
                      <td className="py-2 px-2">{req.name}</td>
                      <td className="py-2 px-2">
                        <Badge variant="secondary" className={
                          req.status === "Sent" ? "bg-blue-100 text-blue-700" :
                          req.status === "Delivered" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">{req.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle>How WhatsApp Feedback Requests Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Send a personalized WhatsApp message with a feedback survey link to your customer.</li>
            <li>Customers open the link and submit their feedback instantly.</li>
            <li>Track delivery and response status in your dashboard.</li>
            <li>For bulk requests, contact your admin or use the API integration.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 