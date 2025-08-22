import { IoTDashboard } from "@/components/iot/iot-dashboard"
import { AdminOrPartner } from "@/components/auth/role-guard"

export default function IoTPage() {
  return (
    <AdminOrPartner>
      <IoTDashboard />
    </AdminOrPartner>
  )
}
