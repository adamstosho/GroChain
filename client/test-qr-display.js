// Test QR codes display
console.log('🧪 Testing QR Codes Display...')

if (typeof window !== 'undefined') {
  // Check if we're on the QR codes page
  if (window.location.pathname === '/dashboard/qr-codes') {
    console.log('✅ On QR codes page')

    // Check for QR code table
    const table = document.querySelector('table')
    if (table) {
      console.log('✅ QR codes table found')

      // Check table rows
      const rows = table.querySelectorAll('tbody tr')
      console.log('📊 Table rows found:', rows.length)

      if (rows.length > 0) {
        rows.forEach((row, index) => {
          const cells = row.querySelectorAll('td')
          if (cells.length >= 7) {
            const dateCell = cells[0].textContent || ''
            const codeCell = cells[1].textContent || ''
            const harvestCell = cells[2].textContent || ''
            const locationCell = cells[3].textContent || ''
            const statusCell = cells[4].textContent || ''
            const scansCell = cells[5].textContent || ''

            console.log(`📋 Row ${index + 1}:`)
            console.log('   Date:', dateCell.trim())
            console.log('   Code:', codeCell.trim())
            console.log('   Harvest:', harvestCell.trim())
            console.log('   Location:', locationCell.trim())
            console.log('   Status:', statusCell.trim())
            console.log('   Scans:', scansCell.trim())
            console.log('')
          }
        })
      } else {
        console.log('⚠️ No table rows found - QR codes may not be loading')
      }
    } else {
      console.log('❌ QR codes table not found')
    }

    // Check stats cards
    const statsCards = document.querySelectorAll('[class*="grid-cols-4"] [class*="border"]')
    console.log('📈 Stats cards found:', statsCards.length)

    if (statsCards.length >= 4) {
      const totalQRCodes = statsCards[0].querySelector('div[class*="text-2xl"]')?.textContent || '0'
      const activeCodes = statsCards[1].querySelector('div[class*="text-2xl"]')?.textContent || '0'
      const verifiedCodes = statsCards[2].querySelector('div[class*="text-2xl"]')?.textContent || '0'
      const totalScans = statsCards[3].querySelector('div[class*="text-2xl"]')?.textContent || '0'

      console.log('📊 Stats Display:')
      console.log('   Total QR Codes:', totalQRCodes)
      console.log('   Active Codes:', activeCodes)
      console.log('   Verified Codes:', verifiedCodes)
      console.log('   Total Scans:', totalScans)
    }

  } else {
    console.log('❌ Not on QR codes page. Current path:', window.location.pathname)
  }
} else {
  console.log('❌ Not in browser environment')
}

