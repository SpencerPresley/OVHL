// scripts/nhl-teams-info.ts

import nhlTeams from '@nhl-api/teams';

// Log the top level structure
console.log("Top level keys:", Object.keys(nhlTeams));

// Try to find where the actual teams data is stored
Object.entries(nhlTeams).forEach(([key, value]) => {
  console.log(`\nExamining key: ${key}`);
  
  if (Array.isArray(value)) {
    console.log(`Found an array with ${value.length} items`);
    console.log("First item sample:", value[0]);
  } else if (typeof value === 'object' && value !== null) {
    console.log(`Found an object with ${Object.keys(value).length} keys`);
    
    // If this is an object that contains the teams, let's check its values
    const nestedValues = Object.values(value);
    if (nestedValues.length > 0) {
      console.log(`This object has ${nestedValues.length} values`);
      console.log("First value sample:", nestedValues[0]);
    }
  }
});