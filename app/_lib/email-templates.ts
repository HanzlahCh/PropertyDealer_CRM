export function newLeadEmailTemplate(lead: {
  name: string;
  email: string;
  phone?: string;
  propertyInterest: string;
  budget: number;
  source?: string;
}): string {
  const budgetFormatted =
    lead.budget >= 10_000_000
      ? `${(lead.budget / 10_000_000).toFixed(1)} Crore`
      : lead.budget >= 100_000
      ? `${(lead.budget / 100_000).toFixed(1)} Lac`
      : lead.budget.toLocaleString();

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1724; color: #e6eef8; border-radius: 12px; overflow: hidden;">
      <div style="background: #4f46e5; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: #fff;">🏠 New Lead Created</h1>
      </div>
      <div style="padding: 32px;">
        <p style="margin: 0 0 20px; color: #94a3b8;">A new lead has been added to your CRM pipeline.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8; width: 120px;">Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); font-weight: 600;">${lead.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1);">${lead.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8;">Phone</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1);">${lead.phone || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8;">Property</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1);">${lead.propertyInterest}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8;">Budget</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); font-weight: 600;">PKR ${budgetFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94a3b8;">Source</td>
            <td style="padding: 10px 0;">${lead.source}</td>
          </tr>
        </table>
        <div style="margin-top: 28px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/leads" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View in CRM →
          </a>
        </div>
      </div>
    </div>
  `;
}

export function leadAssignedEmailTemplate(data: {
  agentName: string;
  leadName: string;
  leadEmail: string;
  propertyInterest: string;
  budget: number;
  leadId: string;
}): string {
  const budgetFormatted =
    data.budget >= 10_000_000
      ? `${(data.budget / 10_000_000).toFixed(1)} Crore`
      : data.budget >= 100_000
      ? `${(data.budget / 100_000).toFixed(1)} Lac`
      : data.budget.toLocaleString();

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1724; color: #e6eef8; border-radius: 12px; overflow: hidden;">
      <div style="background: #4f46e5; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: #fff;">📋 Lead Assigned to You</h1>
      </div>
      <div style="padding: 32px;">
        <p style="margin: 0 0 20px; color: #94a3b8;">
          Hi <strong style="color: #e6eef8;">${data.agentName}</strong>, a lead has been assigned to you.
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8; width: 120px;">Lead</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); font-weight: 600;">${data.leadName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1);">${data.leadEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1); color: #94a3b8;">Property</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1);">${data.propertyInterest}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94a3b8;">Budget</td>
            <td style="padding: 10px 0; font-weight: 600;">PKR ${budgetFormatted}</td>
          </tr>
        </table>
        <div style="margin-top: 28px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/leads/${data.leadId}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View Lead Details →
          </a>
        </div>
      </div>
    </div>
  `;
}
