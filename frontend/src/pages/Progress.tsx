import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Tabs,
  Tab,
  styled,
  useTheme,
  Button
} from '@mui/material';
import { PageContainer } from '../components/layout';
import { PageTitle } from '../components/ui/Typography';
import TabPanel from '../components/progress/TabPanel';
import TimeRangeSelector from '../components/progress/TimeRangeSelector';
import WorkoutPerformanceTab from '../components/progress/workout/WorkoutPerformanceTab';
import BodyMetricsTab from '../components/progress/body/BodyMetricsTab';
import ConsistencyTab from '../components/progress/consistency/ConsistencyTab';
import { TimeRange } from '../services/progressService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useThemeContext } from '../contexts/ThemeContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#252525' : '#f5f5f5',
  borderBottom: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  '& .MuiTab-root': {
    minHeight: 48,
    fontWeight: 500,
    textTransform: 'none',
    fontSize: '1rem',
  },
  '& .Mui-selected': {
  color: theme.palette.primary.main,
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  }
}));

const Progress: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const theme = useTheme();
  const { mode } = useThemeContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTabs, setSelectedTabs] = useState({
    workout: true,
    body: true,
    consistency: true,
  });
  const [loadingReport, setLoadingReport] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  };

  // Helper to get time range label
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'All Time';
    }
  };

  // Open dialog
  const handleOpenDialog = () => setDialogOpen(true);
  // Close dialog
  const handleCloseDialog = () => setDialogOpen(false);

  // Handle checkbox change
  const handleTabCheckbox = (tab: 'workout' | 'body' | 'consistency') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTabs(prev => ({ ...prev, [tab]: e.target.checked }));
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    setDialogOpen(false);
    setLoadingReport(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // --- Visually Enhanced Cover Page ---
    // Accent bar
    pdf.setFillColor(theme.palette.primary.main);
    pdf.rect(0, 0, pageWidth, 18, 'F');
    // Background
    pdf.setFillColor(mode === 'dark' ? 30 : 245, mode === 'dark' ? 30 : 245, mode === 'dark' ? 30 : 245);
    pdf.rect(0, 18, pageWidth, pageHeight - 18, 'F');
    // Title
    pdf.setTextColor(theme.palette.primary.main);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(36);
    pdf.text('Progress Tracking Report', pageWidth / 2, 60, { align: 'center' });
    // Subtitle
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(20);
    pdf.setTextColor(mode === 'dark' ? 255 : 40, mode === 'dark' ? 255 : 40, mode === 'dark' ? 255 : 40);
    pdf.text(`Time Range: ${getTimeRangeLabel()}`, pageWidth / 2, 85, { align: 'center' });
    pdf.setFontSize(15);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 100, { align: 'center' });
    // Description
    pdf.setFontSize(14);
    pdf.setTextColor(mode === 'dark' ? 220 : 80, mode === 'dark' ? 220 : 80, mode === 'dark' ? 220 : 80);
    pdf.text('This report summarizes your fitness progress across all key metrics.', pageWidth / 2, 120, { align: 'center' });
    // Included sections
    pdf.setFontSize(13);
    pdf.setTextColor(theme.palette.primary.main);
    pdf.text('Included Sections:', pageWidth / 2, 140, { align: 'center' });
    let y = 150;
    pdf.setFontSize(13);
    pdf.setTextColor(mode === 'dark' ? 255 : 40, mode === 'dark' ? 255 : 40, mode === 'dark' ? 255 : 40);
    if (selectedTabs.workout) {
      pdf.text('- Workout Performance', pageWidth / 2, y, { align: 'center' });
      y += 10;
    }
    if (selectedTabs.body) {
      pdf.text('- Body Metrics', pageWidth / 2, y, { align: 'center' });
      y += 10;
    }
    if (selectedTabs.consistency) {
      pdf.text('- Consistency', pageWidth / 2, y, { align: 'center' });
      y += 10;
    }

    // --- Tab Pages ---
    const tabList = [
      { id: 'workout-performance-tab', enabled: selectedTabs.workout, tabIndex: 0 },
      { id: 'body-metrics-tab', enabled: selectedTabs.body, tabIndex: 1 },
      { id: 'consistency-tab', enabled: selectedTabs.consistency, tabIndex: 2 },
    ];
    const originalTabValue = tabValue;
    for (const tab of tabList) {
      if (!tab.enabled) continue;
      setTabValue(tab.tabIndex);
      await new Promise(r => setTimeout(r, 2000));
      const element = document.getElementById(tab.id);
      if (element) {
        const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        if (!imgData.startsWith('data:image/png')) {
          alert(`Failed to capture ${tab.id.replace(/-/g, ' ')}. Please make sure the tab is visible and try again.`);
          continue;
        }
        const imgProps = pdf.getImageProperties(imgData);
        let imgWidth = pageWidth - 20;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }
        pdf.addPage();
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }
    }
    setTabValue(originalTabValue);
    pdf.save('progress-report.pdf');
    setLoadingReport(false);
  };

  return (
    <PageContainer>
      {/* Loading Overlay */}
      {loadingReport && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CircularProgress size={60} sx={{ color: theme.palette.primary.main, mb: 3 }} />
          <Box sx={{ color: '#fff', fontSize: 22, fontWeight: 600, mb: 1 }}>Generating Report…</Box>
          <Box sx={{ color: '#fff', fontSize: 16, opacity: 0.8 }}>This may take a few seconds</Box>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <PageTitle>Progress Tracking</PageTitle>
        <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
      </Box>
      
      <StyledPaper>
        <StyledTabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Workout Performance" />
          <Tab label="Body Metrics" />
          <Tab label="Consistency" />
        </StyledTabs>
        {/* Always render all tab contents, but only show the active one */}
        <div style={{ display: tabValue === 0 ? 'block' : 'none' }}>
          <div id="workout-performance-tab">
            <WorkoutPerformanceTab timeRange={timeRange} />
          </div>
        </div>
        <div style={{ display: tabValue === 1 ? 'block' : 'none' }}>
          <div id="body-metrics-tab">
            <BodyMetricsTab timeRange={timeRange} />
          </div>
        </div>
        <div style={{ display: tabValue === 2 ? 'block' : 'none' }}>
          <div id="consistency-tab">
            <ConsistencyTab timeRange={timeRange} />
          </div>
        </div>
      </StyledPaper>
      {/* Generate Report Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Generate Report
        </Button>
      </Box>
      {/* Tab Selection Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Select Sections to Include</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={selectedTabs.workout} onChange={handleTabCheckbox('workout')} />}
              label="Workout Performance"
            />
            <FormControlLabel
              control={<Checkbox checked={selectedTabs.body} onChange={handleTabCheckbox('body')} />}
              label="Body Metrics"
            />
            <FormControlLabel
              control={<Checkbox checked={selectedTabs.consistency} onChange={handleTabCheckbox('consistency')} />}
              label="Consistency"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained" color="primary" disabled={!(selectedTabs.workout || selectedTabs.body || selectedTabs.consistency)}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Progress; 