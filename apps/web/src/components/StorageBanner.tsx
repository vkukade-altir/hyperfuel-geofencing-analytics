import { Alert, Box, Stack, Typography, TechnicalAccordion } from "@/ds";
import { useHealth } from "@/api/hooks";

export function StorageBanner() {
  const { data: health } = useHealth();

  if (!health) return null;
  if (health.storage_backend === "supabase" && health.supabase_configured) return null;

  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 500 }}>Dashboard is not showing live data</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        The numbers on this screen come from the analytics service. Right now it is not
        connected to your database, so you may see empty or outdated results.
      </Typography>
      <Box sx={{ mt: 1.5 }}>
        <TechnicalAccordion title="How to fix (for engineers)">
          <Stack component="ol" sx={{ m: 0, pl: 2.5, gap: 0.75 }}>
            <Typography component="li" variant="caption">Open Supabase → Project Settings → API</Typography>
            <Typography component="li" variant="caption">
              Copy Project URL and service_role key into{" "}
              <Box component="code" sx={{ fontFamily: "monospace", bgcolor: "action.hover", px: 0.5, borderRadius: 0.5 }}>
                apps/api/.env
              </Box>
            </Typography>
            <Typography component="li" variant="caption">
              Set{" "}
              <Box component="code" sx={{ fontFamily: "monospace", bgcolor: "action.hover", px: 0.5, borderRadius: 0.5 }}>
                USE_MEMORY_STORE=false
              </Box>
            </Typography>
            <Typography component="li" variant="caption">Restart: npm run dev</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
            Current backend:{" "}
            {health.storage_backend === "memory" ? "in-memory (not saved)" : "invalid database config"}
          </Typography>
        </TechnicalAccordion>
      </Box>
    </Alert>
  );
}
