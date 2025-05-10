"use server"

import { redirect } from "next/navigation"

export async function submitReview(formData: FormData) {
  // In a real app, this would save the review to a database
  const rating = formData.get("rating") as string
  const comment = formData.get("comment") as string
  const companyId = formData.get("companyId") as string

  console.log("Review submitted:", { rating, comment, companyId })

  // Get company configuration
  const company = await getCompanyConfig(companyId)

  // Determine where to redirect based on rating
  const ratingValue = Number.parseInt(rating, 10)
  if (ratingValue >= company.threshold) {
    redirect(company.positiveRedirect)
  } else {
    redirect(company.negativeRedirect)
  }
}

async function getCompanyConfig(companyId: string) {
  // In a real app, this would fetch from a database
  return {
    threshold: 4,
    positiveRedirect: "https://www.google.com/business",
    negativeRedirect: "https://docs.google.com/forms/",
  }
}
