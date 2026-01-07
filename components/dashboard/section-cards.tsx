import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

export function SectionCards() {
  return (
    <div className="win7-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      {/* Total Revenue Card */}
      <div className="win7-card">
        <div className="win7-card-header">Total Revenue</div>
        <div className="win7-card-content">
          <div className="win7-card-value">$1,250.00</div>
          <div className="win7-card-description" style={{ display: "flex", alignItems: "center", gap: 4, color: "#2e7d32" }}>
            <IconTrendingUp size={14} />
            +12.5%
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#666" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            Trending up this month <IconTrendingUp size={12} />
          </div>
          <div style={{ color: "#888" }}>Visitors for the last 6 months</div>
        </div>
      </div>

      {/* New Customers Card */}
      <div className="win7-card">
        <div className="win7-card-header">New Customers</div>
        <div className="win7-card-content">
          <div className="win7-card-value">1,234</div>
          <div className="win7-card-description" style={{ display: "flex", alignItems: "center", gap: 4, color: "#c62828" }}>
            <IconTrendingDown size={14} />
            -20%
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#666" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            Down 20% this period <IconTrendingDown size={12} />
          </div>
          <div style={{ color: "#888" }}>Acquisition needs attention</div>
        </div>
      </div>

      {/* Active Accounts Card */}
      <div className="win7-card">
        <div className="win7-card-header">Active Accounts</div>
        <div className="win7-card-content">
          <div className="win7-card-value">45,678</div>
          <div className="win7-card-description" style={{ display: "flex", alignItems: "center", gap: 4, color: "#2e7d32" }}>
            <IconTrendingUp size={14} />
            +12.5%
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#666" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            Strong user retention <IconTrendingUp size={12} />
          </div>
          <div style={{ color: "#888" }}>Engagement exceed targets</div>
        </div>
      </div>

      {/* Growth Rate Card */}
      <div className="win7-card">
        <div className="win7-card-header">Growth Rate</div>
        <div className="win7-card-content">
          <div className="win7-card-value">4.5%</div>
          <div className="win7-card-description" style={{ display: "flex", alignItems: "center", gap: 4, color: "#2e7d32" }}>
            <IconTrendingUp size={14} />
            +4.5%
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#666" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            Steady performance increase <IconTrendingUp size={12} />
          </div>
          <div style={{ color: "#888" }}>Meets growth projections</div>
        </div>
      </div>
    </div>
  )
}
