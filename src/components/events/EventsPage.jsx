import { Box, Typography } from '@mui/material'

export default function EventsPage() {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Events
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Coming soon.
      </Typography>
    </Box>
  )
}
