"use client";

// Registers this site's WebMCP tools so AI agents can read key facts, find pages,
// and send an enquiry on the user's behalf. Renders nothing; feature-detects
// WebMCP and no-ops where unsupported (see lib/webmcp.ts). Mounted once in the
// public-site layout. Self-contained (reads siteConfig + primaryNav) so it clones
// straight into sister sites.

import { useEffect } from "react";
import { registerAgentTool } from "@/lib/webmcp";
import { siteConfig } from "@/lib/site-config";
import { primaryNav } from "@/lib/nav";

export function AgentTools() {
  useEffect(() => {
    const unregister: Array<() => void> = [];

    unregister.push(
      registerAgentTool({
        name: "get_care_home_info",
        title: "Care home information",
        description: `Get key facts about ${siteConfig.name}: location, contact details, services, capacity, opening hours, areas served and accreditations.`,
        annotations: { readOnlyHint: true },
        inputSchema: { type: "object", properties: {} },
        execute: () => ({
          name: siteConfig.name,
          provider: siteConfig.legalName,
          description: siteConfig.description,
          address: `${siteConfig.address.streetAddress}, ${siteConfig.address.addressLocality}, ${siteConfig.address.addressRegion} ${siteConfig.address.postalCode}`,
          phone: siteConfig.telephone,
          email: siteConfig.email,
          officeHours: siteConfig.officeHours,
          beds: siteConfig.beds,
          areasServed: [...siteConfig.areaServed],
          accreditations: [...siteConfig.accreditations],
          website: siteConfig.url,
        }),
      }),
    );

    unregister.push(
      registerAgentTool({
        name: "list_pages",
        title: "List website pages",
        description: `List the main pages on the ${siteConfig.name} website, with their paths, so you can link the user to the right place.`,
        annotations: { readOnlyHint: true },
        inputSchema: { type: "object", properties: {} },
        execute: () => ({
          pages: primaryNav.map((p) => ({
            name: p.name,
            url: `${siteConfig.url}${p.path}`,
          })),
        }),
      }),
    );

    unregister.push(
      registerAgentTool({
        name: "submit_enquiry",
        title: "Send an enquiry",
        description: `Send an enquiry to ${siteConfig.name} on the user's behalf — for example to book a visit or request a brochure. Always confirm the details with the user before calling this.`,
        inputSchema: {
          type: "object",
          properties: {
            firstName: { type: "string", description: "The person's first name" },
            lastName: { type: "string", description: "The person's last name" },
            email: { type: "string", description: "Contact email address" },
            phone: { type: "string", description: "Contact phone number" },
            intent: {
              type: "string",
              enum: ["BOOK_VISIT", "BROCHURE"],
              description:
                "BOOK_VISIT to arrange a visit, BROCHURE to request a brochure / more information",
            },
            message: { type: "string", description: "The enquiry message" },
          },
          required: ["firstName", "email", "intent"],
        },
        execute: async (input) => {
          const res = await fetch("/api/public/leads/", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...input, source: "webmcp-agent" }),
          });
          if (!res.ok) throw new Error(`Enquiry failed (${res.status})`);
          return {
            ok: true,
            message: `Your enquiry has been sent to ${siteConfig.name}. The team will be in touch.`,
          };
        },
      }),
    );

    return () => unregister.forEach((u) => u());
  }, []);

  return null;
}
