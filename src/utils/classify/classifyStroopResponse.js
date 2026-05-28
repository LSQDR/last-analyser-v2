
export function classifyError(inkColour, word, buttonClicked) {
  if (buttonClicked === word.toLowerCase()) return 'wordInterference'
  return 'randomError'
}


export function getPracticeFeedback(correct, errorType) {
  if (correct) return (
    { 
        icon: '✓', 
        message: 'Correct! You clicked the ink colour.', 
        colour: 'green' 
    })

  if (errorType === 'wordInterference') return (
    { 
        icon: '✗', 
        message: "You clicked the word's meaning, click the ink colour.", 
        colour: 'red' 
    })
  return (
    { 
        icon: '✗', 
        message: 'Incorrect. Click the colour the word is printed in.', 
        colour: 'red' 
    })
}
