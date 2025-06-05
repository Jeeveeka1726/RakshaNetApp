const API_BASE_URL = "http://localhost:5500/api"

export interface Contact {
  id: string
  name: string
  phone: string
  relationship: string
  isVerified: boolean
  createdAt: string
}

export const contactService = {
  async sendOTP(phone: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/contacts/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone }),
    })
    return await response.json()
  },

  async verifyOTP(phone: string, otp: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/contacts/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone, otp }),
    })
    return await response.json()
  },

  async addContact(name: string, phone: string, relationship: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone, relationship }),
    })
    return await response.json()
  },

  async getContacts(token: string) {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return await response.json()
  },

  async updateContact(id: string, name: string, relationship: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, relationship }),
    })
    return await response.json()
  },

  async deleteContact(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return await response.json()
  },
}
