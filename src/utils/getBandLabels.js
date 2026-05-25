// Research anchors:
// CPT: Conners CPT-II norms (Conners 2004); omission threshold 25%, CV threshold 35%
// SST: Verbruggen et al. 2019; healthy adult SSRT 150–250ms
// Stroop: Troyer et al. 2006 Victoria Stroop norms; interference ~60–100ms typical
// N-Back: Klatzky et al.; Jaeggi 2010; corrected hit rate ≥60% typical adult range


// ─── Task 1  Sustained Attention (CPT) ─────────────────────────────────────

export function getCPTBand(omissionRate, cv, attentionDecaySlope) {
  const flags = [];
  if (omissionRate > 25)        flags.push('omission');
  if (cv > 35)                  flags.push('variability');
  if (attentionDecaySlope > 0)  flags.push('decay');

  if (flags.length === 0) return { 
    label: 'Strong',   
    colour: 'green',  
    description: 'Your focus held up well across all three rounds.' 
  };

  if (flags.length === 1) return { 
    label: 'Typical',  
    colour: 'blue',   
    description: 'One attention pattern was outside the typical range, see below for detail.' 
  };

  if (flags.length === 2) return { 
    label: 'Variable', 
    colour: 'yellow', 
    description: 'Two attention patterns were outside the typical range.' 
  };

  return { 
    label: 'Low',       
    colour: 'red',    
    description: 'Multiple attention indicators fell outside the typical adult range.' 
  };
}

// ─── Task 2 Inhibition Control (SST) ──────────────────────────────────────

export function getSSTBand(ssrtMs, isValid, stopAccuracy) {
  if (!isValid) return { 
    label: 'Inconclusive', 
    colour: 'yellow', 
    description: 'The task did not converge on a stable stopping threshold, see the reliability note below.' 
  };

  if (ssrtMs < 250 && stopAccuracy >= 60) return { 
    label: 'Fast',      
    colour: 'green',  
    description: 'Your inhibition speed was at the quick end of the typical adult range.' 
  };

  if (ssrtMs < 300 && stopAccuracy >= 50) return { 
    label: 'Typical',   
    colour: 'blue',   
    description: 'Your inhibition speed was within the typical adult range (150–300ms).' 
  };

  if (ssrtMs < 400) return { 
    label: 'Slow',      
    colour: 'yellow', 
    description: 'Your inhibition speed was above the typical adult range.' 
  };

  return { 
    label: 'Very Slow', 
    colour: 'red',    
    description: 'Your inhibition speed was considerably above the typical adult range (>400ms).' 
  };
}

// ─── Task 3  Interference Control (Stroop) ─────────────────────────────────

// Research basis: Troyer et al. 2006. 60–100ms typical for healthy adults.
export function getStroopBand(trueInterferenceMs) {
  if (trueInterferenceMs < 60)  return { 
    label: 'Minimal',  
    colour: 'green',  
    description: 'Conflicting words had very little effect on your response time.' 
  };

  if (trueInterferenceMs < 130) return { 
    label: 'Typical',  
    colour: 'blue',   
    description: 'The interference effect was within the typical range for healthy adults.' 
  };

  if (trueInterferenceMs < 200) return { 
    label: 'Elevated', 
    colour: 'yellow', 
    description: 'The conflicting words slowed you down more than is typical for healthy adults.' 
  };

  return { 
    label: 'High',     
    colour: 'red',    
    description: 'The interference from word meanings was considerably higher than the typical adult range.' 
  };
}


export function getInterferenceBand(trueInterferenceMs) {
  if (trueInterferenceMs < 50)  return { 
    band: 'minimal',  
    label: 'Minimal Interference', 
    description: 'Very strong interference control, the word meaning had little effect.',
    flag: false 
  };

  if (trueInterferenceMs < 100) return { 
    band: 'typical',  
    label: 'Typical Range',         
    description: 'Interference control within the typical adult range.',
    flag: false 
  };

  if (trueInterferenceMs < 150) return { 
    band: 'elevated', 
    label: 'Somewhat Elevated',     
    description: 'Slightly elevated interference, upper range of typical adult performance.',
    flag: false 
  };

  return { 
    band: 'high',     
    label: 'High Interference',     
    description: 'Elevated cognitive interference, the conflicting word meaningfully slowed colour-naming.', 
    flag: true  
  };
}

// ─── Task 4 Working Memory (N-Back) ────────────────────────────────────────

export function getNBackBand(correctedHitRate) {
  if (correctedHitRate >= 80) return { 
    label: 'Strong',   
    colour: 'green',  
    description: 'Your 2-back working memory score was above the typical adult range.' 
  };

  if (correctedHitRate >= 60) return { 
    abel: 'Typical',  
    colour: 'blue',   
    description: 'Your working memory updating score was within the typical adult range.' 
  };

  if (correctedHitRate >= 40) return { 
    label: 'Low',      
    colour: 'yellow', 
    description: 'Your working memory score was below the typical threshold. 2-back tasks are sensitive to sleep, stress, and practice effects.' 
  };

  return { 
    label: 'Very Low', 
    colour: 'red',    
    description: 'Your working memory score was considerably below the typical adult range.' 
  };
  
}