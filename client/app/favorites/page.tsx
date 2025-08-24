import { Metadata } from "next"
import { FavoritesPage } from "@/components/marketplace/favorites-page"

export const metadata: Metadata = {
  title: "My Favorites | GroChain",
  description: "View and manage your saved products and favorite items",
}

export default function Favorites() {
  return <FavoritesPage />
}

export const dynamic = 'force-dynamic'
