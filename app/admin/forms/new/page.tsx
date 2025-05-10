"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Eye } from "lucide-react"

export default function NewFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    companyName: "",
    welcomeMessage: "How would you rate your experience?",
    thankYouMessage: "Thank you for your feedback!",
    positiveRedirectUrl: "",
    negativeRedirectUrl: "",
    ratingThreshold: "4",
    primaryColor: "#4f46e5",
    logoUrl: "",
    enableComments: true,
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save the form to the database
    console.log("Form submitted:", formData)
    // Redirect to the forms list
  }

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      handleChange("slug", slug)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/admin/forms" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forms
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Review Form</h1>
        <Link href={`/preview/${formData.slug || "preview"}`} target="_blank">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="redirects">Redirects</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set up the basic details for your review form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Form Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Summer Promotion"
                      required
                    />
                    <p className="text-sm text-muted-foreground">Internal name for your reference</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Form URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleChange("slug", e.target.value)}
                        placeholder="summer-promo"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generateSlug}>
                        Generate
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      yourcompany.reviewflow.com/{formData.slug || "your-slug"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={formData.welcomeMessage}
                    onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                    placeholder="How would you rate your experience?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thankYouMessage">Thank You Message</Label>
                  <Textarea
                    id="thankYouMessage"
                    value={formData.thankYouMessage}
                    onChange={(e) => handleChange("thankYouMessage", e.target.value)}
                    placeholder="Thank you for your feedback!"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableComments"
                    checked={formData.enableComments}
                    onCheckedChange={(checked) => handleChange("enableComments", checked)}
                  />
                  <Label htmlFor="enableComments">Enable comment field for additional feedback</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redirects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redirect Settings</CardTitle>
                <CardDescription>Configure where to send customers based on their rating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ratingThreshold">Rating Threshold</Label>
                  <Select
                    value={formData.ratingThreshold}
                    onValueChange={(value) => handleChange("ratingThreshold", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 and above is positive</SelectItem>
                      <SelectItem value="4">4 and above is positive</SelectItem>
                      <SelectItem value="5">Only 5 is positive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Ratings at or above this value will be considered positive
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positiveRedirectUrl">Positive Review Redirect URL</Label>
                  <Input
                    id="positiveRedirectUrl"
                    value={formData.positiveRedirectUrl}
                    onChange={(e) => handleChange("positiveRedirectUrl", e.target.value)}
                    placeholder="https://www.google.com/business/..."
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Where to send customers who leave positive reviews (e.g., Google Reviews)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negativeRedirectUrl">Feedback Form Redirect URL</Label>
                  <Input
                    id="negativeRedirectUrl"
                    value={formData.negativeRedirectUrl}
                    onChange={(e) => handleChange("negativeRedirectUrl", e.target.value)}
                    placeholder="https://docs.google.com/forms/..."
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Where to send customers who leave negative reviews (e.g., Google Form)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of your review form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Company Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    placeholder="https://your-company.com/logo.png"
                  />
                  <p className="text-sm text-muted-foreground">Leave blank to use your company name as text</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <CardFooter className="flex justify-between px-0">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">Create Review Form</Button>
          </CardFooter>
        </Tabs>
      </form>
    </div>
  )
}
