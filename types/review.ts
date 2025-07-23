export interface Review {
  id: string
  rating: number
  comment: string | null
  feedback_categories: string[] | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_status: string | null
  is_positive: boolean | null
  created_at: string
  form: {
    id: string
    name: string
  }
  neutral_feedback_categories?: string[] | null
  neutral_other_feedback?: string | null
} 