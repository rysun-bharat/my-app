import { Avatar, Box, Card, CardContent, Container, Grid, Typography } from '@mui/material'

const stats = [
  { label: 'My Events', value: 0, emoji: '📅', color: '#1976d2', bg: '#e3f0fc' },
  { label: 'My Users', value: 0, emoji: '👥', color: '#388e3c', bg: '#e8f5e9' },
  { label: 'My Surveys', value: 0, emoji: '📋', color: '#f57c00', bg: '#fff3e0' },
]

export default function DashboardHome() {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is an overview of your activity.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map(({ label, value, emoji, color, bg }) => (
          <Grid size={{ xs: 12, sm: 4 }} key={label}>
            <Card
              elevation={0}
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {label}
                  </Typography>
                  <Avatar
                    sx={{
                      bgcolor: bg,
                      width: 40,
                      height: 40,
                      fontSize: 20,
                      color,
                    }}
                  >
                    {emoji}
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color={color}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
