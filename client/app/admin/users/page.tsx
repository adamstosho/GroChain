import { Metadata } from "next"
import { AdminUsersPage } from "@/components/admin/admin-users-page"

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard | GroChain",
  description: "Manage all users, roles, and permissions in the GroChain system",
}

export default function AdminUsers() {
  return <AdminUsersPage />
}

export const dynamic = 'force-dynamic'
